import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";

const HIGH_EXPOSURE_THRESHOLD = 5;
const LOW_MASTERY_THRESHOLD = 0.4;
const HIGH_MASTERY_THRESHOLD = 0.85;
const MIN_CARDS_FOR_SUGGESTION = 3;

/**
 * Aggregation: FlashCardProgress by category
 * Suggestion rules:
 * - High exposure + low mastery → increase priority (users struggling)
 * - High mastery + high exposure → decrease priority (users got it)
 */
export async function POST() {
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
      include: { flashCard: { select: { categoryId: true } } },
    });

    const byCategory = new Map();
    for (const p of progress) {
      const cid = p.flashCard?.categoryId;
      if (!cid) continue;
      if (!byCategory.has(cid)) {
        byCategory.set(cid, {
          exposure: [],
          mastery: [],
          count: 0,
        });
      }
      const agg = byCategory.get(cid);
      agg.exposure.push(p.exposureCount);
      agg.mastery.push(p.masteryScore);
      agg.count++;
    }

    const categories = await prisma.flashCardCategory.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const adminPriorities = await prisma.categoryPriorityAdmin.findMany({
      where: { tenantId },
    });
    const adminByCat = new Map(adminPriorities.map((p) => [p.categoryId, p]));

    const suggestions = [];

    for (const [categoryId, agg] of byCategory.entries()) {
      if (agg.count < MIN_CARDS_FOR_SUGGESTION) continue;

      const avgExposure =
        agg.exposure.reduce((a, b) => a + b, 0) / agg.exposure.length;
      const avgMastery =
        agg.mastery.reduce((a, b) => a + b, 0) / agg.mastery.length;

      const current = adminByCat.get(categoryId)?.priority ?? 5;
      let suggestedPriority = null;
      let reason = null;

      if (
        avgExposure >= HIGH_EXPOSURE_THRESHOLD &&
        avgMastery < LOW_MASTERY_THRESHOLD
      ) {
        suggestedPriority = Math.min(10, current + 2);
        reason = `High exposure (avg ${avgExposure.toFixed(1)}) with low mastery (${(avgMastery * 100).toFixed(0)}%). Increase priority to surface this category more.`;
      } else if (
        avgExposure >= HIGH_EXPOSURE_THRESHOLD &&
        avgMastery >= HIGH_MASTERY_THRESHOLD
      ) {
        suggestedPriority = Math.max(1, current - 2);
        reason = `High exposure (avg ${avgExposure.toFixed(1)}) with high mastery (${(avgMastery * 100).toFixed(0)}%). Decrease priority to focus on struggling categories.`;
      }

      if (suggestedPriority != null && suggestedPriority !== current) {
        const existing = await prisma.flashCardCategoryPrioritySuggestion.findFirst({
          where: {
            tenantId,
            categoryId,
            appliedAt: null,
            dismissedAt: null,
          },
        });
        if (!existing) {
          const created = await prisma.flashCardCategoryPrioritySuggestion.create({
            data: {
              tenantId,
              categoryId,
              suggestedPriority,
              reason,
            },
            include: { category: { select: { name: true } } },
          });
          suggestions.push(created);
        }
      }
    }

    return successResponse({
      generated: suggestions.length,
      suggestions: suggestions.map((s) => ({
        id: s.id,
        categoryId: s.categoryId,
        categoryName: s.category?.name,
        suggestedPriority: s.suggestedPriority,
        reason: s.reason,
        generatedAt: s.generatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
