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

    // Progress is tracked via CategoryStat (per user per category), not QuizAttempt
    const categoryStats = await prisma.categoryStat.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: {
        lastAttempt: "desc",
      },
    });

    // Completed = sum of category completions (passed quizzes per category)
    const completed = categoryStats.reduce(
      (sum, stat) => sum + (stat.completed || 0),
      0
    );

    // In-progress = categories with attempts but not all completed
    const inProgress = categoryStats.filter(
      (stat) => (stat.attempts || 0) > (stat.completed || 0)
    ).length;

    // Most recent in-progress category for "Continue Where You Left Off"
    const lastInProgress = categoryStats.find(
      (stat) => (stat.attempts || 0) > (stat.completed || 0)
    );

    let currentModule = null;
    if (lastInProgress?.category) {
      const progress = Math.round(lastInProgress.bestScore ?? 0);
      const estimatedMinutes = Math.max(5, Math.round((100 - progress) / 10));

      currentModule = {
        id: lastInProgress.categoryId,
        title: lastInProgress.category.name,
        category: lastInProgress.category.name,
        categoryId: lastInProgress.categoryId,
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
