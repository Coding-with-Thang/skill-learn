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
 * GET: List pending (not applied, not dismissed) suggestions
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

    const suggestions = await prisma.flashCardCategoryPrioritySuggestion.findMany({
      where: {
        tenantId,
        appliedAt: null,
        dismissedAt: null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { generatedAt: "desc" },
    });

    const adminPriorities = await prisma.categoryPriorityAdmin.findMany({
      where: { tenantId },
    });
    const adminByCat = new Map(adminPriorities.map((p) => [p.categoryId, p]));

    const enriched = suggestions.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      categoryName: s.category?.name,
      suggestedPriority: s.suggestedPriority,
      currentPriority: adminByCat.get(s.categoryId)?.priority ?? 5,
      reason: s.reason,
      generatedAt: s.generatedAt,
    }));

    return successResponse({ suggestions: enriched });
  } catch (error) {
    return handleApiError(error);
  }
}
