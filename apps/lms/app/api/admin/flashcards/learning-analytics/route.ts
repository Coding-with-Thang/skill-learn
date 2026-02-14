import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId } from "@skill-learn/lib/utils/tenant";

/**
 * GET: Admin aggregate flash card analytics per category/tenant
 */
export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const progress = await prisma.flashCardProgress.findMany({
      where: { tenantId },
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
          userCount: new Set(),
        });
      }
      const agg = byCategory.get(cid);
      agg.exposure.push(p.exposureCount);
      agg.mastery.push(p.masteryScore);
      agg.userCount.add(p.userId);
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
      userCount: agg.userCount.size,
    }));

    const totalCards = progress.length;
    const totalUsers = new Set(progress.map((p) => p.userId)).size;
    const totalExposures = progress.reduce((s, p) => s + p.exposureCount, 0);
    const avgMasteryOverall =
      totalCards > 0
        ? progress.reduce((s, p) => s + p.masteryScore, 0) / totalCards
        : 0;

    return successResponse({
      byCategory: byCategoryArray,
      totalCards,
      totalUsers,
      totalExposures,
      avgMasteryOverall,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
