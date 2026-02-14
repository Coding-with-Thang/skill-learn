import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { getTenantContext } from "@skill-learn/lib/utils/tenant";
import { getFlashCardLimitsFromDb } from "@/lib/flashCardLimits";
import { computeFingerprint } from "@skill-learn/lib/utils/flashCardFingerprint";
import {
  requireAnyPermission,
  hasAnyPermission,
  PERMISSIONS,
} from "@skill-learn/lib/utils/permissions";
import { flashCardUserBulkCreateSchema } from "@/lib/zodSchemas";

const FLASHCARD_CREATE_PERMS = [
  PERMISSIONS.FLASHCARDS_CREATE,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
  PERMISSIONS.FLASHCARDS_MANAGE_TENANT,
];

/**
 * POST: Create multiple flash cards at once (user)
 * Enforces subscription tier batch limit (maxCardsPerDeck used as batch cap)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const raw = await req.json();
    const parsed = flashCardUserBulkCreateSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues?.[0]?.message || "Invalid request",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }
    const data = parsed.data;

    const context = await getTenantContext();
    if (context instanceof NextResponse) return context;

    const { tenantId, tenant, user } = context;
    const permResult = await requireAnyPermission(
      FLASHCARD_CREATE_PERMS,
      tenantId
    );
    if (permResult instanceof NextResponse) return permResult;

    const tier = tenant?.subscriptionTier || "free";
    const limits = await getFlashCardLimitsFromDb(prisma, tier);
    const batchLimit =
      limits.maxCardsPerDeck < 0 ? 500 : limits.maxCardsPerDeck;

    const cardsToCreate = data.cards.slice(0, batchLimit);

    const category = await prisma.flashCardCategory.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ tenantId }, { isGlobal: true }],
      },
    });
    if (!category) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const isAdmin = await hasAnyPermission(
      clerkId,
      [
        PERMISSIONS.FLASHCARDS_MANAGE_TENANT,
        PERMISSIONS.DASHBOARD_ADMIN,
        PERMISSIONS.DASHBOARD_MANAGER,
      ],
      tenantId
    );

    const existingFingerprints = new Set(
      (
        await prisma.flashCard.findMany({
          where: { tenantId },
          select: { fingerprint: true },
        })
      ).map((c) => c.fingerprint)
    );

    type CardWithCategory = Prisma.FlashCardGetPayload<{
      include: { category: { select: { id: true; name: true } } };
    }>;
    const created: CardWithCategory[] = [];
    let skipped = 0;

    for (const item of cardsToCreate) {
      const fingerprint = computeFingerprint(item.question, item.answer);
      if (existingFingerprints.has(fingerprint)) {
        skipped++;
        continue;
      }

      try {
        const card = await prisma.flashCard.create({
          data: {
            tenantId,
            categoryId: data.categoryId,
            question: item.question.trim(),
            answer: item.answer.trim(),
            fingerprint,
            createdBy: user.id,
            createdRole: isAdmin ? "admin" : "user",
            isPublic: false,
            tags: item.tags ?? [],
            difficulty: item.difficulty ?? null,
          },
          include: { category: { select: { id: true, name: true } } },
        });
        existingFingerprints.add(fingerprint);
        created.push(card);
      } catch (err) {
        if ((err as { code?: string }).code === "P2002") {
          existingFingerprints.add(fingerprint);
          skipped++;
        } else throw err;
      }
    }
    const skippedTotal =
      data.cards.length > batchLimit
        ? skipped + (data.cards.length - batchLimit)
        : skipped;

    if (data.cards.length > batchLimit) {
      return successResponse({
        cards: created,
        created: created.length,
        skipped: skippedTotal,
        message: `Created ${created.length} card(s). Limit is ${batchLimit} per batch.`,
      });
    }

    return successResponse({
      cards: created,
      created: created.length,
      skipped: skippedTotal,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
