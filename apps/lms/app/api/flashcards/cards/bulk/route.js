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
import { getTenantContext } from "@skill-learn/lib/utils/tenant.js";
import { getFlashCardLimitsFromDb } from "@/lib/flashCardLimits.js";
import { computeFingerprint } from "@skill-learn/lib/utils/flashCardFingerprint.js";
import {
  requireAnyPermission,
  hasAnyPermission,
  PERMISSIONS,
} from "@skill-learn/lib/utils/permissions.js";
import { z } from "zod";

const flashCardUserBulkCreateSchema = z.object({
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  cards: z
    .array(
      z.object({
        question: z.string().min(1).max(2000),
        answer: z.string().min(1).max(5000),
        tags: z.array(z.string().max(50)).optional().default([]),
        difficulty: z.enum(["easy", "good", "hard"]).nullable().optional(),
      })
    )
    .min(1, "At least one card is required"),
});

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
export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const raw = await req.json();
    const parsed = flashCardUserBulkCreateSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors?.[0]?.message || "Invalid request",
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

    const existingFingerprints = new Set();
    const created = [];

    for (const item of cardsToCreate) {
      const fingerprint = computeFingerprint(item.question, item.answer);
      if (existingFingerprints.has(fingerprint)) continue;
      existingFingerprints.add(fingerprint);

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
      created.push(card);
    }

    const skipped = cardsToCreate.length - created.length;
    if (data.cards.length > batchLimit) {
      return successResponse({
        cards: created,
        created: created.length,
        skipped: skipped + (data.cards.length - batchLimit),
        message: `Created ${created.length} card(s). Limit is ${batchLimit} per batch.`,
      });
    }

    return successResponse({
      cards: created,
      created: created.length,
      skipped,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
