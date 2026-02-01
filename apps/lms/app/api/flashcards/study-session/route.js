import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { flashCardStudySessionSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";
import {
  resolveCategoryPriority,
  applyMasteryWeight,
} from "@skill-learn/lib/utils/flashCardPriority.js";
import { isCardDue } from "@skill-learn/lib/utils/sm2.js";

const DEFAULT_LIMIT = 25;
const DUE_THRESHOLD_RATIO = 0.6; // If fewer than 60% of limit are due, allow new cards

/**
 * Weighted shuffle: higher weight = higher chance to appear earlier
 * Runtime only, not persisted
 */
function weightedShuffle(items, weights) {
  const combined = items.map((item, i) => ({
    item,
    weight: weights[i] ?? 1,
  }));
  const totalWeight = combined.reduce((s, c) => s + c.weight, 0);
  const result = [];
  let remaining = [...combined];

  while (remaining.length > 0) {
    let r = Math.random() * totalWeight;
    for (let i = 0; i < remaining.length; i++) {
      r -= remaining[i].weight;
      if (r <= 0) {
        result.push(remaining[i].item);
        totalWeight -= remaining[i].weight;
        remaining.splice(i, 1);
        break;
      }
    }
  }
  return result;
}

export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId, categoryIds, virtualDeck, limit = DEFAULT_LIMIT } =
      await validateRequestBody(req, flashCardStudySessionSchema);

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const userId = user.id;

    // 1. Resolve accessible cards (owned + shared)
    let cardIds = new Set();

    if (deckId) {
      const deck = await prisma.flashCardDeck.findFirst({
        where: { id: deckId, tenantId, ownerId: userId },
      });
      if (!deck) {
        throw new AppError("Deck not found", ErrorType.NOT_FOUND, {
          status: 404,
        });
      }
      deck.cardIds.forEach((id) => cardIds.add(id));
    } else {
      // Owned cards (createdBy = userId)
      const owned = await prisma.flashCard.findMany({
        where: {
          tenantId,
          createdBy: userId,
          ...(categoryIds?.length
            ? { categoryId: { in: categoryIds } }
            : {}),
        },
        select: { id: true },
      });
      owned.forEach((c) => cardIds.add(c.id));

      // Shared cards (FlashCardAccess)
      const shared = await prisma.flashCardAccess.findMany({
        where: { tenantId, userId },
        include: { flashCard: true },
      });
      shared.forEach((a) => {
        if (
          !categoryIds?.length ||
          categoryIds.includes(a.flashCard.categoryId)
        ) {
          cardIds.add(a.flashCardId);
        }
      });
    }

    if (cardIds.size === 0) {
      return successResponse({
        cards: [],
        totalDue: 0,
        totalNew: 0,
      });
    }

    const cardIdList = Array.from(cardIds);

    // 2. Load progress in bulk
    const progressList = await prisma.flashCardProgress.findMany({
      where: {
        tenantId,
        userId,
        flashCardId: { in: cardIdList },
      },
    });
    const progressByCard = new Map(
      progressList.map((p) => [p.flashCardId, p])
    );

    // 3. SM-2 due filter + virtual deck filters
    const now = new Date();
    let candidateIds = cardIdList;

    if (virtualDeck === "due_today" || !virtualDeck) {
      const dueIds = cardIdList.filter((id) =>
        isCardDue(progressByCard.get(id), now)
      );
      const newCount = cardIdList.length - dueIds.length;
      const allowNew =
        virtualDeck === "due_today"
          ? false
          : dueIds.length < Math.ceil(limit * DUE_THRESHOLD_RATIO) && newCount > 0;
      candidateIds = allowNew ? cardIdList : dueIds;
    } else if (virtualDeck === "needs_attention") {
      candidateIds = cardIdList.filter((id) => {
        const prog = progressByCard.get(id);
        return prog && prog.masteryScore < 0.4 && prog.exposureCount >= 2;
      });
      if (candidateIds.length === 0) candidateIds = cardIdList;
    } else if (virtualDeck === "company_focus" && categoryIds?.length) {
      candidateIds = cardIdList;
    }

    const dueIds = cardIdList.filter((id) =>
      isCardDue(progressByCard.get(id), now)
    );
    const newCount = cardIdList.length - dueIds.length;

    if (candidateIds.length === 0) {
      return successResponse({
        cards: [],
        totalDue: dueIds.length,
        totalNew: newCount,
      });
    }

    // 4. Load cards with category
    const cards = await prisma.flashCard.findMany({
      where: { id: { in: candidateIds } },
      include: { category: { select: { id: true, name: true } } },
    });
    const cardMap = new Map(cards.map((c) => [c.id, c]));

    // 5. Resolve category priorities
    const [adminPriorities, userPriorities, settings] = await Promise.all([
      prisma.categoryPriorityAdmin.findMany({
        where: {
          tenantId,
          categoryId: { in: [...new Set(cards.map((c) => c.categoryId))] },
        },
      }),
      prisma.categoryPriorityUser.findMany({
        where: {
          tenantId,
          userId,
          categoryId: { in: [...new Set(cards.map((c) => c.categoryId))] },
        },
      }),
      prisma.flashCardPrioritySettings.findUnique({
        where: { tenantId },
      }),
    ]);

    const adminByCat = new Map(
      adminPriorities.map((p) => [p.categoryId, p.priority])
    );
    const userByCat = new Map(
      userPriorities.map((p) => [p.categoryId, p.priority])
    );
    const overrideMode = settings?.overrideMode ?? "USER_OVERRIDES_ADMIN";

    // 6. Build weighted list
    const weighted = candidateIds
      .map((id) => {
        const card = cardMap.get(id);
        if (!card) return null;
        const progress = progressByCard.get(id);
        const mastery = progress?.masteryScore ?? 0;
        const basePriority = resolveCategoryPriority({
          adminPriority: adminByCat.get(card.categoryId) ?? undefined,
          userPriority: userByCat.get(card.categoryId) ?? undefined,
          overrideMode,
        });
        const weight = applyMasteryWeight(basePriority, mastery);
        return { card, weight };
      })
      .filter(Boolean);

    // 7. Weighted shuffle
    const shuffled = weightedShuffle(
      weighted.map((w) => w.card),
      weighted.map((w) => w.weight)
    );

    // 8. Slice to limit
    const selected = shuffled.slice(0, limit);

    return successResponse({
      cards: selected.map((c) => ({
        id: c.id,
        question: c.question,
        answer: c.answer,
        categoryId: c.categoryId,
        categoryName: c.category?.name,
        tags: c.tags,
        difficulty: c.difficulty,
      })),
      totalDue: dueIds.length,
      totalNew: newCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
