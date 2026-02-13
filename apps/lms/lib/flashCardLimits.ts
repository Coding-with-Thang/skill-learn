/**
 * Flash card limits by subscription tier
 * Defaults (used when DB has no override)
 * FREE: 3 decks, 30 cards/deck
 * starter: 10 decks, 50 cards/deck
 * pro: unlimited decks, 100 cards/deck
 * enterprise: unlimited decks, 1,000 cards/deck
 */

export const FLASHCARD_LIMITS = {
  free: { maxDecks: 3, maxCardsPerDeck: 30 },
  starter: { maxDecks: 10, maxCardsPerDeck: 50 },
  pro: { maxDecks: -1, maxCardsPerDeck: 100 }, // -1 = unlimited
  enterprise: { maxDecks: -1, maxCardsPerDeck: 1000 },
};

/**
 * Get limits for a subscription tier (sync, uses defaults only)
 * @param {string} tier - free | starter | pro | enterprise
 * @returns {{ maxDecks: number, maxCardsPerDeck: number }}
 */
export function getFlashCardLimits(tier) {
  const t = (tier || "free").toLowerCase();
  return FLASHCARD_LIMITS[t] ?? FLASHCARD_LIMITS.free;
}

/**
 * Get limits for a subscription tier from DB (async)
 * Falls back to FLASHCARD_LIMITS if not found in DB.
 * @param {object} prisma - Prisma client
 * @param {string} tier - free | starter | pro | enterprise
 * @returns {Promise<{ maxDecks: number, maxCardsPerDeck: number }>}
 */
export async function getFlashCardLimitsFromDb(prisma, tier) {
  const t = (tier || "free").toLowerCase();
  try {
    const row = await prisma.flashCardTierLimit.findUnique({
      where: { tier: t },
    });
    if (row) {
      return { maxDecks: row.maxDecks, maxCardsPerDeck: row.maxCardsPerDeck };
    }
  } catch {
    // Table may not exist yet (migration pending)
  }
  return getFlashCardLimits(t);
}
