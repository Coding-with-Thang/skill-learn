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
import { flashCardDeckShareSchema } from "@/lib/zodSchemas";
import { getTenantContext } from "@skill-learn/lib/utils/tenant.js";
import { requireAnyPermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";

const FLASHCARD_READ_PERMS = [
  PERMISSIONS.FLASHCARDS_READ,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
];

/**
 * POST: Share deck(s) with user(s) or all in tenant
 * - deckIds: array of deck IDs to share
 * - recipientUserIds: "all" | userId[]
 */
export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const context = await getTenantContext();
    if (context instanceof NextResponse) return context;

    const permResult = await requireAnyPermission(FLASHCARD_READ_PERMS, context.tenantId);
    if (permResult instanceof NextResponse) return permResult;

    const { deckIds, recipientUserIds } = await validateRequestBody(
      req,
      flashCardDeckShareSchema
    );

    const { tenantId, user } = context;
    const sharedBy = user.id;

    // Verify user owns all decks
    const ownedDecks = await prisma.flashCardDeck.findMany({
      where: {
        id: { in: deckIds },
        tenantId,
        ownerId: sharedBy,
      },
      select: { id: true },
    });

    const ownedIds = new Set(ownedDecks.map((d) => d.id));
    const invalid = deckIds.filter((id) => !ownedIds.has(id));
    if (invalid.length > 0) {
      throw new AppError(
        "One or more decks not found or not owned by you",
        ErrorType.NOT_FOUND,
        { status: 404 }
      );
    }

    let sharedCount = 0;

    if (recipientUserIds === "all") {
      // Share to all: set isPublic on each deck
      await prisma.flashCardDeck.updateMany({
        where: { id: { in: deckIds } },
        data: { isPublic: true },
      });
      sharedCount = deckIds.length;
    } else {
      // Share to specific users: create FlashCardDeckShare for each (deck, user) pair
      const toCreate = [];
      for (const deckId of deckIds) {
        for (const userId of recipientUserIds) {
          if (userId === sharedBy) continue; // Don't share with self
          toCreate.push({
            tenantId,
            deckId,
            sharedBy,
            sharedTo: userId,
          });
        }
      }

      for (const item of toCreate) {
        await prisma.flashCardDeckShare.upsert({
          where: {
            deckId_sharedTo: { deckId: item.deckId, sharedTo: item.sharedTo },
          },
          create: item,
          update: {},
        });
        sharedCount++;
      }
    }

    return successResponse({
      shared: true,
      deckCount: deckIds.length,
      recipientCount:
        recipientUserIds === "all"
          ? "all"
          : recipientUserIds.filter((id) => id !== sharedBy).length,
      message:
        recipientUserIds === "all"
          ? `Shared ${deckIds.length} deck(s) with everyone in your workspace`
          : `Shared ${deckIds.length} deck(s) with ${recipientUserIds.filter((id) => id !== sharedBy).length} user(s)`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
