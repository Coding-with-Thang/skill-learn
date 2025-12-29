import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

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
      category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          isActive: true,
        },
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

    return NextResponse.json({ category });
  } catch (error) {
    return handleApiError(error);
  }
}
