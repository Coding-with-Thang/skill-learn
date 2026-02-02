import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

const DEFAULT_LIMITS = {
  free: { maxDecks: 3, maxCardsPerDeck: 30 },
  starter: { maxDecks: 10, maxCardsPerDeck: 50 },
  pro: { maxDecks: -1, maxCardsPerDeck: 100 },
  enterprise: { maxDecks: -1, maxCardsPerDeck: 1000 },
};

const TIERS = ["free", "starter", "pro", "enterprise"];

async function ensureDefaults() {
  const existing = await prisma.flashCardTierLimit.findMany({
    select: { tier: true },
  });
  const existingTiers = new Set(existing.map((r) => r.tier));
  for (const tier of TIERS) {
    if (!existingTiers.has(tier)) {
      await prisma.flashCardTierLimit.create({
        data: {
          tier,
          maxDecks: DEFAULT_LIMITS[tier].maxDecks,
          maxCardsPerDeck: DEFAULT_LIMITS[tier].maxCardsPerDeck,
        },
      });
    }
  }
}

/**
 * GET: List all flash card tier limits (super admin only)
 */
export async function GET() {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    await ensureDefaults();

    const limits = await prisma.flashCardTierLimit.findMany({
      orderBy: { tier: "asc" },
    });

    const byTier = {};
    for (const row of limits) {
      byTier[row.tier] = {
        id: row.id,
        tier: row.tier,
        maxDecks: row.maxDecks,
        maxCardsPerDeck: row.maxCardsPerDeck,
        updatedAt: row.updatedAt,
      };
    }

    return Response.json({
      limits: TIERS.map((t) => byTier[t] ?? { tier: t, ...DEFAULT_LIMITS[t] }),
    });
  } catch (error) {
    console.error("[flashcard-tier-limits] GET error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch limits" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update one or more tier limits (super admin only)
 * Body: { limits: [{ tier, maxDecks?, maxCardsPerDeck? }, ...] }
 */
export async function PATCH(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const body = await request.json();
    const updates = body.limits || (body.tier ? [body] : []);

    if (!Array.isArray(updates) || updates.length === 0) {
      return Response.json(
        { error: "Provide limits array or single tier object" },
        { status: 400 }
      );
    }

    const results = [];
    for (const u of updates) {
      const tier = (u.tier || "").toLowerCase();
      if (!TIERS.includes(tier)) continue;

      const data = {};
      if (typeof u.maxDecks === "number" && u.maxDecks >= -1) data.maxDecks = u.maxDecks;
      // -1 = unlimited; LMS treats maxCardsPerDeck < 0 as unlimited
      if (
        typeof u.maxCardsPerDeck === "number" &&
        (u.maxCardsPerDeck >= 1 || u.maxCardsPerDeck === -1)
      )
        data.maxCardsPerDeck = u.maxCardsPerDeck;

      if (Object.keys(data).length === 0) continue;

      const updated = await prisma.flashCardTierLimit.upsert({
        where: { tier },
        create: {
          tier,
          maxDecks: data.maxDecks ?? DEFAULT_LIMITS[tier].maxDecks,
          maxCardsPerDeck: data.maxCardsPerDeck ?? DEFAULT_LIMITS[tier].maxCardsPerDeck,
        },
        update: data,
      });
      results.push(updated);
    }

    return Response.json({ limits: results });
  } catch (error) {
    console.error("[flashcard-tier-limits] PATCH error:", error);
    return Response.json(
      { error: error.message || "Failed to update limits" },
      { status: 500 }
    );
  }
}
