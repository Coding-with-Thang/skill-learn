import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

/**
 * GET /api/categories/:categoryId
 * Fetches a category with its quizzes
 */
export async function GET(request, { params }) {
  try {
    const { categoryId } = await params

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      )
    }

    // Fetch category with quizzes
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
        isActive: true
      },
      include: {
        quizzes: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            timeLimit: true,
            passingScore: true,
            categoryId: true,
            questions: {
              select: {
                id: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ...category
    })

  } catch (error) {
    console.error("Error fetching category:", error)
    return handleApiError(error)
  }
}
