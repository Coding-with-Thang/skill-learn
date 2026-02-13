import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { flashCardCategoryUpdateSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import type { RouteContext } from "@/types";

type CategoryIdParams = { categoryId: string };

/**
 * PUT: Update flash card category (admin)
 */
export async function PUT(
  req: NextRequest,
  { params }: RouteContext<CategoryIdParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { categoryId } = await params;
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
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<CategoryIdParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { categoryId } = await params;

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
