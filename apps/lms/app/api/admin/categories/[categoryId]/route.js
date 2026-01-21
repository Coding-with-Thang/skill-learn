import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody, validateRequestParams } from "@skill-learn/lib/utils/validateRequest.js";
import { categoryUpdateSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { objectIdSchema } from "@/lib/zodSchemas";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant.js";

// Get a specific category
export async function GET(request, { params }) {
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

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a category
export async function PUT(request, { params }) {
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

    // Update category
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      },
    });

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a category
export async function DELETE(request, { params }) {
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
