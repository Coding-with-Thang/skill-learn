import { NextResponse } from "next/server";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import { prisma } from '@skill-learn/database';
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";

/**
 * GET /api/user/progress
 * Fetches user's training progress and statistics
 */
export async function GET() {
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

    // Fetch user's quiz attempts to calculate stats (using database user ID)
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        quiz: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate completed count (passed quizzes)
    const completed = quizAttempts.filter((attempt) => attempt.passed).length;

    // Calculate in-progress count (attempted but not passed)
    const uniqueInProgressQuizzes = new Set(
      quizAttempts
        .filter((attempt) => !attempt.passed)
        .map((attempt) => attempt.quizId)
    );
    const inProgress = uniqueInProgressQuizzes.size;

    // Get the most recent incomplete quiz for "Continue Where You Left Off"
    const lastIncompleteAttempt = quizAttempts.find(
      (attempt) => !attempt.passed
    );

    let currentModule = null;
    if (lastIncompleteAttempt) {
      const quiz = lastIncompleteAttempt.quiz;
      const progress = lastIncompleteAttempt.score || 0;

      // Estimate time remaining (mock calculation)
      const estimatedMinutes = Math.max(5, Math.round((100 - progress) / 10));

      currentModule = {
        id: quiz.id,
        title: quiz.title,
        category: quiz.category?.name || "Training",
        categoryId: quiz.categoryId,
        progress: progress,
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
