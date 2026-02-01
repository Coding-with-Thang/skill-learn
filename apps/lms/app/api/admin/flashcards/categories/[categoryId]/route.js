import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { flashCardCategoryUpdateSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";

async function getParams(context) {
  const params =
    typeof context.params?.then === "function"
      ? await context.params
      : context.params;
  return params;
}

/**
 * PUT: Update flash card category (admin)
 */
export async function PUT(req, context) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { categoryId } = await getParams(context);
    const data = await validateRequestBody(req, flashCardCategoryUpdateSchema);

    const existing = await prisma.flashCardCategory.findFirst({
      where: { id: categoryId, tenantId },
    });
    if (!existing) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const category = await prisma.flashCardCategory.update({
      where: { id: categoryId },
      data,
      include: { _count: { select: { flashCards: true } } },
    });

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE: Delete flash card category (admin). Cascades to cards.
 */
export async function DELETE(req, context) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { categoryId } = await getParams(context);

    const existing = await prisma.flashCardCategory.findFirst({
      where: { id: categoryId, tenantId },
      include: { _count: { select: { flashCards: true } } },
    });
    if (!existing) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    await prisma.flashCardCategory.delete({ where: { id: categoryId } });
    return successResponse({
      deleted: true,
      cardsRemoved: existing._count.flashCards,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
