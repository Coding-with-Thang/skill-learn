import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import type { RouteContext } from "@/types";

type QuizIdParams = { quizId: string };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<QuizIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const clerkId = authResult;

    const { quizId } = await params;
    if (!quizId) {
      throw new AppError("Quiz ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const tenantId = await getTenantId();
    const whereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        ...whereClause,
      },
      select: { id: true },
    });

    if (!quiz) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const stats = await prisma.quizProgress.findUnique({
      where: {
        userId_quizId: {
          userId: user.id,
          quizId,
        },
      },
      select: {
        attempts: true,
        completedAttempts: true,
        passedAttempts: true,
        averageScore: true,
        bestScore: true,
        lastAttemptAt: true,
        lastPassedAt: true,
      },
    });

    if (!stats) {
      return successResponse({
        attempts: 0,
        completed: 0,
        passedAttempts: 0,
        averageScore: null,
        bestScore: null,
        lastAttempt: null,
        lastPassedAt: null,
        status: "not-started",
      });
    }

    return successResponse({
      attempts: stats.attempts,
      completed: stats.completedAttempts,
      passedAttempts: stats.passedAttempts,
      averageScore: stats.averageScore,
      bestScore: stats.bestScore,
      lastAttempt: stats.lastAttemptAt,
      lastPassedAt: stats.lastPassedAt,
      status:
        stats.passedAttempts > 0
          ? "completed"
          : stats.attempts > 0
            ? "in-progress"
            : "not-started",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
