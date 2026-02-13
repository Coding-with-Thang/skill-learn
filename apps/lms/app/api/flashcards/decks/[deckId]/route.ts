import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestParams, validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { deckIdParamSchema, flashCardDeckUpdateSchema } from "@/lib/zodSchemas";
import { getTenantId, getTenantContext } from "@skill-learn/lib/utils/tenant";
import { getFlashCardLimitsFromDb } from "@/lib/flashCardLimits";
import type { RouteContext } from "@/types";

type DeckIdParams = { deckId: string };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<DeckIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId } = await validateRequestParams(deckIdParamSchema, params);

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

    const deck = await prisma.flashCardDeck.findFirst({
      where: { id: deckId, tenantId, ownerId: user.id },
    });

    if (!deck) {
      throw new AppError("Deck not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const cards = await prisma.flashCard.findMany({
      where: { id: { in: deck.cardIds } },
      include: { category: { select: { id: true, name: true } } },
    });
    const cardMap = new Map(cards.map((c) => [c.id, c]));
    const orderedCards = deck.cardIds
      .map((id) => cardMap.get(id))
      .filter(Boolean);

    return successResponse({
      deck: { ...deck, cards: orderedCards },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext<DeckIdParams>) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId } = await validateRequestParams(deckIdParamSchema, params);
    const data = await validateRequestBody(req, flashCardDeckUpdateSchema);

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

    const deck = await prisma.flashCardDeck.findFirst({
      where: { id: deckId, tenantId, ownerId: user.id },
    });

    if (!deck) {
      throw new AppError("Deck not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    if (data.cardIds != null) {
      const context = await getTenantContext();
      if (context instanceof NextResponse) return context;
      const tier = context.tenant?.subscriptionTier || "free";
      const limits = await getFlashCardLimitsFromDb(prisma, tier);
      if (limits.maxCardsPerDeck >= 0 && data.cardIds.length > limits.maxCardsPerDeck) {
        throw new AppError(
          `Deck cannot exceed ${limits.maxCardsPerDeck} cards. Upgrade your plan for larger decks.`,
          ErrorType.VALIDATION,
          { status: 403 }
        );
      }
    }

    const updateData = {};
    if (data.name != null) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.cardIds != null) {
      updateData.cardIds = data.cardIds;
      // Keep hiddenCardIds in sync: only ids still in cardIds
      const cardSet = new Set(data.cardIds);
      const filteredHidden = (deck.hiddenCardIds ?? []).filter((id) => cardSet.has(id));
      if (filteredHidden.length !== (deck.hiddenCardIds ?? []).length) {
        updateData.hiddenCardIds = filteredHidden;
      }
    }
    if (data.hiddenCardIds != null) updateData.hiddenCardIds = data.hiddenCardIds;
    if (data.categoryIds != null) updateData.categoryIds = data.categoryIds;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    const updated = await prisma.flashCardDeck.update({
      where: { id: deckId },
      data: updateData,
    });

    return successResponse({ deck: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<DeckIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId } = await validateRequestParams(deckIdParamSchema, params);

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

    const deck = await prisma.flashCardDeck.findFirst({
      where: { id: deckId, tenantId, ownerId: user.id },
    });

    if (!deck) {
      throw new AppError("Deck not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    await prisma.flashCardDeck.delete({ where: { id: deckId } });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
