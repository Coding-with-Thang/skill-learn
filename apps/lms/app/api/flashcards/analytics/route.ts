import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId } from "@skill-learn/lib/utils/tenant";

/**
 * GET: User's flash card learning analytics (exposure vs mastery by category)
 */
export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

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
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const progress = await prisma.flashCardProgress.findMany({
      where: { tenantId, userId: user.id },
      include: {
        flashCard: {
          select: { categoryId: true, category: { select: { name: true } } },
        },
      },
    });

    const byCategory = new Map();
    for (const p of progress) {
      const cid = p.flashCard?.categoryId;
      const cname = p.flashCard?.category?.name ?? "Unknown";
      if (!cid) continue;
      if (!byCategory.has(cid)) {
        byCategory.set(cid, {
          categoryId: cid,
          categoryName: cname,
          exposure: [],
          mastery: [],
        });
      }
      const agg = byCategory.get(cid);
      agg.exposure.push(p.exposureCount);
      agg.mastery.push(p.masteryScore);
    }

    const byCategoryArray = Array.from(byCategory.values()).map((agg) => ({
      categoryId: agg.categoryId,
      categoryName: agg.categoryName,
      avgExposure:
        agg.exposure.length > 0
          ? agg.exposure.reduce((a, b) => a + b, 0) / agg.exposure.length
          : 0,
      avgMastery:
        agg.mastery.length > 0
          ? agg.mastery.reduce((a, b) => a + b, 0) / agg.mastery.length
          : 0,
      cardCount: agg.exposure.length,
    }));

    const totalCards = progress.length;
    const totalExposures = progress.reduce((s, p) => s + p.exposureCount, 0);
    const avgMasteryOverall =
      totalCards > 0
        ? progress.reduce((s, p) => s + p.masteryScore, 0) / totalCards
        : 0;

    return successResponse({
      byCategory: byCategoryArray,
      totalCards,
      totalExposures,
      avgMasteryOverall,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
