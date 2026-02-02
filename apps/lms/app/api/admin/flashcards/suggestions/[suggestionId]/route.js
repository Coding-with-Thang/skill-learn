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
import { z } from "zod";

/**
 * POST with action: apply | dismiss
 */
export async function POST(req, context) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const params = typeof context.params?.then === "function" ? await context.params : context.params;
    const { suggestionId } = await z
      .object({ suggestionId: z.string().regex(/^[0-9a-fA-F]{24}$/) })
      .parseAsync({ suggestionId: params.suggestionId });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "apply";

    const suggestion = await prisma.flashCardCategoryPrioritySuggestion.findFirst({
      where: {
        id: suggestionId,
        tenantId,
        appliedAt: null,
        dismissedAt: null,
      },
    });

    if (!suggestion) {
      throw new AppError("Suggestion not found or already acted on", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const now = new Date();

    if (action === "apply") {
      await prisma.$transaction([
        prisma.flashCardCategoryPrioritySuggestion.update({
          where: { id: suggestionId },
          data: { appliedAt: now },
        }),
        prisma.categoryPriorityAdmin.upsert({
          where: {
            tenantId_categoryId: {
              tenantId,
              categoryId: suggestion.categoryId,
            },
          },
          create: {
            tenantId,
            categoryId: suggestion.categoryId,
            priority: suggestion.suggestedPriority,
          },
          update: { priority: suggestion.suggestedPriority },
        }),
      ]);
      return successResponse({ applied: true, priority: suggestion.suggestedPriority });
    }

    if (action === "dismiss") {
      await prisma.flashCardCategoryPrioritySuggestion.update({
        where: { id: suggestionId },
        data: { dismissedAt: now },
      });
      return successResponse({ dismissed: true });
    }

    throw new AppError("Invalid action. Use 'apply' or 'dismiss'.", ErrorType.VALIDATION, {
      status: 400,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
