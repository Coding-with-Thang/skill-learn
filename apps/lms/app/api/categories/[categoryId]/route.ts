import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import type { RouteContext } from "@/types";

type CategoryIdParams = { categoryId: string };

/**
 * GET /api/categories/:categoryId
 * Fetches a category with its quizzes
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<CategoryIdParams>
) {
  try {
    const { categoryId } = await params

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      )
    }

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter categories by tenant or global content using standardized utility
    const categoryWhereClause = buildTenantContentFilter(tenantId, {
      id: categoryId,
      isActive: true,
    });

    // CRITICAL: Filter quizzes by tenant or global content
    const quizWhereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    // Fetch category with quizzes
    // Note: We now filter the category using tenant filter in the where clause
    const category = await prisma.category.findFirst({
      where: categoryWhereClause,
      include: {
        quizzes: {
          where: quizWhereClause,
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
