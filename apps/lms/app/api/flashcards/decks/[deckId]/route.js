import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestParams, validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { z } from "zod";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";

const deckIdSchema = z.object({ deckId: z.string().regex(/^[0-9a-fA-F]{24}$/) });
const deckUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  cardIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  categoryIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

export async function GET(req, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId } = await validateRequestParams(deckIdSchema, params);

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

export async function PATCH(req, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId } = await validateRequestParams(deckIdSchema, params);
    const data = await validateRequestBody(req, deckUpdateSchema);

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

    const updateData = {};
    if (data.name != null) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.cardIds != null) updateData.cardIds = data.cardIds;
    if (data.categoryIds != null) updateData.categoryIds = data.categoryIds;

    const updated = await prisma.flashCardDeck.update({
      where: { id: deckId },
      data: updateData,
    });

    return successResponse({ deck: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { deckId } = await validateRequestParams(deckIdSchema, params);

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
