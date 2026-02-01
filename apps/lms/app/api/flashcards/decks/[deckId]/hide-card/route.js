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
const bodySchema = z.object({
  cardId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  hidden: z.boolean(),
});

/**
 * POST: Hide or unhide a card in a deck
 */
export async function POST(req, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { deckId } = await validateRequestParams(deckIdSchema, params);
    const { cardId, hidden } = await validateRequestBody(req, bodySchema);

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: authResult },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const deck = await prisma.flashCardDeck.findFirst({
      where: { id: deckId, tenantId, ownerId: user.id },
    });

    if (!deck) {
      throw new AppError("Deck not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const hiddenSet = new Set(deck.hiddenCardIds ?? []);

    if (hidden) {
      hiddenSet.add(cardId);
    } else {
      hiddenSet.delete(cardId);
    }

    const updated = await prisma.flashCardDeck.update({
      where: { id: deckId },
      data: { hiddenCardIds: Array.from(hiddenSet) },
    });

    return successResponse({
      hiddenCardIds: updated.hiddenCardIds,
      hidden,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
