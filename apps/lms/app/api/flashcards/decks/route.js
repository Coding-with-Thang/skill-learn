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
import { flashCardDeckCreateSchema } from "@/lib/zodSchemas";
import { getTenantId, getTenantContext } from "@skill-learn/lib/utils/tenant.js";
import { requireAnyPermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";
import { getFlashCardLimitsFromDb } from "@/lib/flashCardLimits.js";

const FLASHCARD_READ_PERMS = [
  PERMISSIONS.FLASHCARDS_READ,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
];

const FLASHCARD_CREATE_PERMS = [
  PERMISSIONS.FLASHCARDS_CREATE,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
  PERMISSIONS.FLASHCARDS_MANAGE_TENANT,
];

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, { status: 400 });
    }

    const permResult = await requireAnyPermission(FLASHCARD_READ_PERMS, tenantId);
    if (permResult instanceof NextResponse) return permResult;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const decks = await prisma.flashCardDeck.findMany({
      where: { tenantId, ownerId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return successResponse({ decks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const data = await validateRequestBody(req, flashCardDeckCreateSchema);

    const context = await getTenantContext();
    if (context instanceof NextResponse) return context;

    const { tenantId, tenant, user } = context;
    const permResult = await requireAnyPermission(FLASHCARD_CREATE_PERMS, tenantId);
    if (permResult instanceof NextResponse) return permResult;
    const tier = tenant?.subscriptionTier || "free";
    const limits = await getFlashCardLimitsFromDb(prisma, tier);

    const deckCount = await prisma.flashCardDeck.count({
      where: { tenantId, ownerId: user.id },
    });
    if (limits.maxDecks >= 0 && deckCount >= limits.maxDecks) {
      throw new AppError(
        `Deck limit reached (${limits.maxDecks} max). Upgrade your plan for more decks.`,
        ErrorType.VALIDATION,
        { status: 403 }
      );
    }

    const cardIds = data.cardIds ?? [];
    if (limits.maxCardsPerDeck >= 0 && cardIds.length > limits.maxCardsPerDeck) {
      throw new AppError(
        `Deck cannot exceed ${limits.maxCardsPerDeck} cards. Upgrade your plan for larger decks.`,
        ErrorType.VALIDATION,
        { status: 403 }
      );
    }

    const deck = await prisma.flashCardDeck.create({
      data: {
        tenantId,
        ownerId: user.id,
        name: data.name,
        description: data.description ?? null,
        cardIds,
        hiddenCardIds: data.hiddenCardIds ?? [],
        categoryIds: data.categoryIds ?? [],
        isPublic: data.isPublic ?? false,
      },
    });

    return successResponse({ deck });
  } catch (error) {
    return handleApiError(error);
  }
}
