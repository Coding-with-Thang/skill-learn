import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getTenantContext } from "@skill-learn/lib/utils/tenant.js";
import { getFlashCardLimitsFromDb } from "@/lib/flashCardLimits.js";

/**
 * GET: Return flash card limits for the current user's subscription tier
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const context = await getTenantContext();
    if (context instanceof NextResponse) return context;

    const { tenantId, tenant, user } = context;
    const tier = tenant?.subscriptionTier || "free";
    const limits = await getFlashCardLimitsFromDb(prisma, tier);

    const deckCount = await prisma.flashCardDeck.count({
      where: { tenantId, ownerId: user.id },
    });

    const maxCardsPerBatch =
      limits.maxCardsPerDeck < 0 ? 500 : limits.maxCardsPerDeck;

    return successResponse({
      limits: {
        maxDecks: limits.maxDecks,
        maxCardsPerDeck: limits.maxCardsPerDeck,
        maxCardsPerBatch,
      },
      currentDeckCount: deckCount,
      subscriptionTier: tier,
      canCreateDeck: limits.maxDecks < 0 || deckCount < limits.maxDecks,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
