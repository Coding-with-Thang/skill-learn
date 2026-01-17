import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant.js";

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

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter quizzes by tenant or global content
    const quizWhereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    // Fetch category with quizzes
    // Note: We filter the category by checking tenant access after fetch
    // and filter quizzes using tenant filter
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
        isActive: true,
      },
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

    // Verify tenant access: category must be tenant-specific or global
    const hasAccess = !category.tenantId || 
                      category.tenantId === tenantId || 
                      (category.isGlobal && !category.tenantId);

    if (!hasAccess) {
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
