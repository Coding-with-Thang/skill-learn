import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

// Get a specific category
export async function GET(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { categoryId } = params;

    if (!categoryId) {
      throw new AppError("Category ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

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

    return NextResponse.json(category);
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

    const { categoryId } = params;
    const data = await request.json();

    if (!categoryId) {
      throw new AppError("Category ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

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

    return NextResponse.json(category);
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

    const { categoryId } = params;

    if (!categoryId) {
      throw new AppError("Category ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

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

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
