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
import { deckIdParamSchema, flashCardDeckHideSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import type { RouteContext } from "@/types";

type DeckIdParams = { deckId: string };

/**
 * POST: Hide or unhide a card in a deck
 */

export async function POST(
  req: NextRequest,
  { params }: RouteContext<DeckIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { deckId } = await validateRequestParams(deckIdParamSchema, params);
    const { cardId, hidden } = await validateRequestBody(req, flashCardDeckHideSchema);

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
