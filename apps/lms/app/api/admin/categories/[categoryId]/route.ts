import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody, validateRequestParams } from "@skill-learn/lib/utils/validateRequest";
import { categoryUpdateSchema , objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";

import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import type { RouteContext } from "@/types";

type CategoryParams = { categoryId: string };

// Get a specific category
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<CategoryParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { categoryId } = await validateRequestParams(
      z.object({ categoryId: objectIdSchema }),
      params
    );

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter categories by tenant or global content using standardized utility
    const whereClause = buildTenantContentFilter(tenantId, {
      id: categoryId,
    });

    const row = await prisma.category.findFirst({
      where: whereClause,
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
    });

    if (!row) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    let imageUrl = row.imageUrl ?? null;
    if (row.fileKey) {
      const url = await getSignedUrl(row.fileKey, 7);
      if (url) imageUrl = url;
    }
    const category = { ...row, imageUrl };

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a category
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<CategoryParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { categoryId } = await validateRequestParams(
      z.object({ categoryId: objectIdSchema }),
      params
    );
    const data = await validateRequestBody(request, categoryUpdateSchema);

    // Update category (only include defined fields)
    type CategoryUpdateFields = z.infer<typeof categoryUpdateSchema>;
    const updateData: Partial<CategoryUpdateFields> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.fileKey !== undefined) updateData.fileKey = data.fileKey;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a category
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<CategoryParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { categoryId } = await validateRequestParams(
      z.object({ categoryId: objectIdSchema }),
      params
    );

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter categories by tenant or global content using standardized utility
    const whereClause = buildTenantContentFilter(tenantId, {
      id: categoryId,
    });

    // Check if category has any quizzes (and verify tenant access)
    const category = await prisma.category.findFirst({
      where: whereClause,
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    if (category._count.quizzes > 0) {
      throw new AppError(
        "Cannot delete category with existing quizzes",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return successResponse({ message: "Category deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
