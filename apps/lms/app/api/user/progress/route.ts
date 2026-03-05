import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { prisma } from '@skill-learn/database';
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

/**
 * GET /api/user/progress
 * Fetches user's training progress and statistics
 */
export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const clerkUserId = authResult;

    // Get database user ID from Clerk userId
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const quizProgress = await prisma.quizProgress.findMany({
      where: { userId: user.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        lastAttemptAt: "desc",
      },
    });

    // Completed = quizzes with at least one passing attempt
    const completed = quizProgress.filter((row) => row.passedAttempts > 0).length;

    // In-progress = started quizzes without a passing attempt yet
    const inProgress = quizProgress.filter(
      (row) => (row.attempts || 0) > 0 && (row.passedAttempts || 0) === 0
    ).length;

    // Most recent in-progress quiz for "Continue Where You Left Off"
    const lastInProgress =
      quizProgress.find(
        (row) => (row.attempts || 0) > 0 && (row.passedAttempts || 0) === 0
      ) ?? null;

    let currentModule: {
      id: string;
      title: string;
      category: string;
      categoryId: string;
      progress: number;
      timeRemaining: string;
      type: string;
    } | null = null;
    if (lastInProgress?.quiz) {
      const progress = Math.round(lastInProgress.bestScore ?? 0);
      const estimatedMinutes = Math.max(5, Math.round((100 - progress) / 10));

      currentModule = {
        id: lastInProgress.quiz.id,
        title: lastInProgress.quiz.title,
        category: lastInProgress.category.name,
        categoryId: lastInProgress.category.id,
        progress,
        timeRemaining: `${estimatedMinutes} mins`,
        type: "quiz",
      };
    }

    return NextResponse.json({
      success: true,
      completed,
      inProgress,
      currentModule,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return handleApiError(error);
  }
}
