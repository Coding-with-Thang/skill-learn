import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { requireAdmin } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { validateRequestBody, validateRequestParams } from "@/lib/utils/validateRequest";
import { categoryUpdateSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { objectIdSchema } from "@/lib/zodSchemas";

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

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    // Check if category has any quizzes
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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
