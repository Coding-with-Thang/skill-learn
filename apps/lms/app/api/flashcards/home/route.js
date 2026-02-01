import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import { requireAnyPermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getTenantContext } from "@skill-learn/lib/utils/tenant.js";
import { getFlashCardLimitsFromDb } from "@/lib/flashCardLimits.js";

/**
 * Flash Cards home: continue studying, my decks, browse categories, recommended
 * Recommended decks are virtual (runtime, not persisted):
 * - Due Today (SM-2 overdue)
 * - Needs Attention (low mastery)
 * - Company Focus (admin priority)
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const context = await getTenantContext();
    if (context instanceof NextResponse) return context;

    const permResult = await requireAnyPermission(
      [PERMISSIONS.FLASHCARDS_READ, PERMISSIONS.DASHBOARD_ADMIN, PERMISSIONS.DASHBOARD_MANAGER],
      context.tenantId
    );
    if (permResult instanceof NextResponse) return permResult;
    if (context instanceof NextResponse) return context;

    const { tenantId, tenant, user } = context;
    const userId = user.id;
    const tier = tenant?.subscriptionTier || "free";
    const limits = await getFlashCardLimitsFromDb(prisma, tier);
    const now = new Date();

    const [decks, deckCount, publicDecks, sharedDecks, categories, progressList, adminPriorities] =
      await Promise.all([
        prisma.flashCardDeck.findMany({
          where: { tenantId, ownerId: userId },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
        prisma.flashCardDeck.count({ where: { tenantId, ownerId: userId } }),
        prisma.flashCardDeck.findMany({
          where: {
            tenantId,
            isPublic: true,
            ownerId: { not: userId },
          },
          orderBy: { updatedAt: "desc" },
          take: 20,
          include: {
            owner: { select: { id: true, username: true } },
          },
        }),
        prisma.flashCardDeckShare.findMany({
          where: { tenantId, sharedTo: userId },
          include: {
            deck: {
              include: {
                owner: { select: { id: true, username: true } },
              },
            },
          },
          orderBy: { sharedAt: "desc" },
          take: 20,
        }),
      prisma.flashCardCategory.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
        include: { _count: { select: { flashCards: true } } },
      }),
      prisma.flashCardProgress.findMany({
        where: { tenantId, userId },
      }),
      prisma.categoryPriorityAdmin.findMany({
        where: { tenantId },
      }),
    ]);

    const ownedCardIds = new Set(
      (
        await prisma.flashCard.findMany({
          where: { tenantId, createdBy: userId },
          select: { id: true },
        })
      ).map((c) => c.id)
    );
    const sharedCardIds = new Set(
      (
        await prisma.flashCardAccess.findMany({
          where: { tenantId, userId },
          select: { flashCardId: true },
        })
      ).map((a) => a.flashCardId)
    );
    const allCardIds = new Set([...ownedCardIds, ...sharedCardIds]);

    const progressByCard = new Map(
      progressList.map((p) => [p.flashCardId, p])
    );

    let dueTodayCount = 0;
    let needsAttentionCount = 0;
    const adminPriorityByCategory = new Map(
      adminPriorities.map((p) => [p.categoryId, p.priority])
    );
    let companyFocusCount = 0;

    for (const cardId of allCardIds) {
      const prog = progressByCard.get(cardId);
      if (!prog) {
        dueTodayCount++;
        continue;
      }
      if (!prog.nextReviewAt || new Date(prog.nextReviewAt) <= now) {
        dueTodayCount++;
      }
      if (prog.masteryScore < 0.4 && prog.exposureCount >= 2) {
        needsAttentionCount++;
      }
    }

    const topAdminCategories = new Set(
      adminPriorities
        .filter((p) => p.priority >= 7)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5)
        .map((p) => p.categoryId)
    );

    if (topAdminCategories.size > 0 && allCardIds.size > 0) {
      const companyFocusCards = await prisma.flashCard.findMany({
        where: {
          id: { in: Array.from(allCardIds) },
          categoryId: { in: Array.from(topAdminCategories) },
        },
        select: { id: true },
      });
      companyFocusCount = companyFocusCards.length;
    }

    const companyFocusCategoryIds = Array.from(topAdminCategories);

    const recommended = [
      {
        id: "due-today",
        type: "virtual",
        name: "Due Today",
        description: "Cards ready for review",
        cardCount: dueTodayCount,
        studyParams: { limit: 25 },
      },
      {
        id: "needs-attention",
        type: "virtual",
        name: "Needs Attention",
        description: "Low mastery, high exposure cards",
        cardCount: needsAttentionCount,
        studyParams: { virtualDeck: "needs_attention", limit: 25 },
      },
      {
        id: "company-focus",
        type: "virtual",
        name: "Company Focus",
        description: "Admin-priority categories",
        cardCount: companyFocusCount,
        studyParams: {
          categoryIds: companyFocusCategoryIds,
          virtualDeck: "company_focus",
          limit: 25,
        },
      },
    ];

    return successResponse({
      decks,
      sharedDecks,
      categories,
      recommended,
      stats: {
        dueToday: dueTodayCount,
        needsAttention: needsAttentionCount,
        companyFocus: companyFocusCount,
      },
      limits: {
        maxDecks: limits.maxDecks,
        maxCardsPerDeck: limits.maxCardsPerDeck,
        currentDeckCount: deckCount,
        canCreateDeck: limits.maxDecks < 0 || deckCount < limits.maxDecks,
        subscriptionTier: tier,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
