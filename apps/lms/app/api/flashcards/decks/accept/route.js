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
import { flashCardDeckAcceptSchema } from "@/lib/zodSchemas";
import { getTenantId, getTenantContext } from "@skill-learn/lib/utils/tenant.js";
import { getFlashCardLimitsFromDb } from "@/lib/flashCardLimits.js";

/**
 * POST: Accept a shared deck — creates a COPY owned by the user.
 * Modifications (add/remove cards, hide, rename) do not affect the original.
 * For each card the user doesn't have access to, adds FlashCardAccess (accept card).
 */
export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId } = await validateRequestBody(req, flashCardDeckAcceptSchema);

    const context = await getTenantContext();
    if (context instanceof NextResponse) return context;

    const { tenantId, tenant, user } = context;
    const userId = user.id;
    const tier = tenant?.subscriptionTier || "free";
    const limits = await getFlashCardLimitsFromDb(prisma, tier);

    const deckCount = await prisma.flashCardDeck.count({
      where: { tenantId, ownerId: userId },
    });
    if (limits.maxDecks >= 0 && deckCount >= limits.maxDecks) {
      throw new AppError(
        "Deck limit reached. Upgrade your plan for more decks.",
        ErrorType.VALIDATION,
        { status: 403 }
      );
    }

    // Deck must be either isPublic (shared to all) or shared to this user via FlashCardDeckShare
    const sourceDeck = await prisma.flashCardDeck.findFirst({
      where: {
        id: deckId,
        tenantId,
        OR: [
          { isPublic: true },
          { deckShares: { some: { sharedTo: userId } } },
        ],
      },
      include: { owner: { select: { id: true } } },
    });

    if (!sourceDeck) {
      throw new AppError("Deck not found or not shared with you", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    if (sourceDeck.ownerId === userId) {
      throw new AppError("You already own this deck", ErrorType.VALIDATION, {
        status: 400,
      });
    }

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

    const acceptedCardIds = [];
    for (const cardId of sourceDeck.cardIds) {
      if (ownedCardIds.has(cardId) || sharedCardIds.has(cardId)) {
        acceptedCardIds.push(cardId);
        continue;
      }
      const card = await prisma.flashCard.findFirst({
        where: { id: cardId, tenantId, isPublic: true },
      });
      if (!card) continue;
      await prisma.flashCardAccess.upsert({
        where: {
          flashCardId_userId: { flashCardId: cardId, userId },
        },
        create: { tenantId, flashCardId: cardId, userId },
        update: {},
      });
      acceptedCardIds.push(cardId);
    }

    const finalCardIds =
      limits.maxCardsPerDeck < 0
        ? acceptedCardIds
        : acceptedCardIds.slice(0, limits.maxCardsPerDeck);

    const newDeck = await prisma.flashCardDeck.create({
      data: {
        tenantId,
        ownerId: userId,
        name: sourceDeck.name,
        description: sourceDeck.description,
        cardIds: finalCardIds,
        hiddenCardIds: [],
        categoryIds: sourceDeck.categoryIds ?? [],
        isPublic: false,
      },
    });

    return successResponse({
      deck: newDeck,
      accepted: true,
      cardCount: newDeck.cardIds.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
