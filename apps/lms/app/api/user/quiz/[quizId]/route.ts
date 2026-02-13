import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import type { RouteContext } from "@/types";

type QuizIdParams = { quizId: string };

/**
 * GET /api/user/quiz/:quizId
 * Fetches a quiz with all questions and options for authenticated users
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteContext<QuizIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { quizId } = await params;
    if (!quizId) {
      throw new AppError("Quiz ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter quiz by tenant or global content
    const whereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    // Use findFirst with tenant filter since findUnique doesn't support OR clauses
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        ...whereClause,
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
            id: true,
            text: true,
            imageUrl: true,
            videoUrl: true,
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    return successResponse({ quiz });
  } catch (error) {
    return handleApiError(error);
  }
}
