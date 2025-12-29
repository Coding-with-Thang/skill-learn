import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;

    if (!categoryId) {
      throw new AppError("Category ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    let category;
    try {
      // Use findUnique for unique identifier lookup
      category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          _count: {
            select: { quizzes: true },
          },
        },
      });
    } catch (prismaError) {
      throw new AppError("Invalid category ID format", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    if (!category) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Validate business rule after fetching
    if (!category.isActive) {
      throw new AppError("Category is not active", ErrorType.VALIDATION, {
        status: 403,
      });
    }

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}
