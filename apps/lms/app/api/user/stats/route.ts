import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found in database", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Build per-category stats from quiz progress rows.
    const quizProgressRows = await prisma.quizProgress.findMany({
      where: {
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    const categoryAccumulator = new Map<
      string,
      {
        name: string;
        attempts: number;
        completed: number;
        weightedScoreTotal: number;
        weightedScoreCount: number;
        bestScore: number;
        lastAttempt: Date | null;
      }
    >();

    for (const row of quizProgressRows) {
      const key = row.categoryId;
      const existing = categoryAccumulator.get(key) ?? {
        name: row.category.name,
        attempts: 0,
        completed: 0,
        weightedScoreTotal: 0,
        weightedScoreCount: 0,
        bestScore: 0,
        lastAttempt: null,
      };

      const completedAttempts = row.completedAttempts || 0;
      const attempts = row.attempts || 0;
      const bestScore = row.bestScore || 0;
      const averageScore = row.averageScore || 0;

      existing.attempts += attempts;
      existing.completed += completedAttempts;
      existing.weightedScoreTotal += averageScore * completedAttempts;
      existing.weightedScoreCount += completedAttempts;
      existing.bestScore = Math.max(existing.bestScore, bestScore);
      if (
        row.lastAttemptAt &&
        (!existing.lastAttempt || row.lastAttemptAt > existing.lastAttempt)
      ) {
        existing.lastAttempt = row.lastAttemptAt;
      }

      categoryAccumulator.set(key, existing);
    }

    const categoryStats = Array.from(categoryAccumulator.entries()).map(
      ([categoryId, value]) => ({
        name: value.name,
        attempts: value.attempts,
        completed: value.completed,
        averageScore:
          value.weightedScoreCount > 0
            ? value.weightedScoreTotal / value.weightedScoreCount
            : 0,
        bestScore: value.bestScore,
        lastAttempt: value.lastAttempt,
        categoryId,
      })
    );
    categoryStats.sort(
      (a, b) =>
        (b.lastAttempt ? new Date(b.lastAttempt).getTime() : 0) -
        (a.lastAttempt ? new Date(a.lastAttempt).getTime() : 0)
    );

    // Calculate aggregated stats
    const totalAttempts = categoryStats.reduce(
      (sum, stat) => sum + (stat.attempts || 0),
      0
    );
    const totalCompleted = categoryStats.reduce(
      (sum, stat) => sum + (stat.completed || 0),
      0
    );

    const weightedScoreTotal = categoryStats.reduce(
      (sum, stat) => sum + (stat.averageScore || 0) * (stat.completed || 0),
      0
    );
    const weightedScoreCount = categoryStats.reduce(
      (sum, stat) => sum + (stat.completed || 0),
      0
    );
    const averageScore =
      weightedScoreCount > 0 ? weightedScoreTotal / weightedScoreCount : 0;

    const bestScore = categoryStats.reduce(
      (maxScore, stat) => Math.max(maxScore, stat.bestScore || 0),
      0
    );

    const recentAttemptDate = categoryStats
      .map((stat) => stat.lastAttempt)
      .filter((date): date is Date => date instanceof Date)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

    // Get user streak data and points
    const userWithStreak = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        currentStreak: true,
        longestStreak: true,
        points: true 
      },
    });
    const totalPoints = userWithStreak?.points || 0;
    const currentStreak = userWithStreak?.currentStreak || 0;
    const longestStreak = userWithStreak?.longestStreak || 0;

    // Fetch recent quiz completions from PointLog
    const recentLogs = await prisma.pointLog.findMany({
      where: {
        userId: user.id,
        reason: { startsWith: "quiz_completed_" }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get current user's tenantId for category list filtering (used later)
    const tenantId = await getTenantId();

    // Enrich logs with quiz titles (look up quiz by id only – user already earned points for it, we just need display names)
    const recentActivity = await Promise.all(recentLogs.map(async (log) => {
      const quizId = log.reason.replace("quiz_completed_", "");
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: { title: true, category: { select: { name: true } } },
      });
      return {
        id: log.id,
        quizTitle: quiz?.title ?? "Unknown Quiz",
        categoryName: quiz?.category?.name ?? "Unknown Category",
        date: log.createdAt,
        type: "Quiz Completion",
        points: log.amount
      };
    }));


    // Get all categories for filtering (filtered by tenant)
    const categoryWhereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const categories = await prisma.category.findMany({
      where: categoryWhereClause,
      select: {
        id: true,
        name: true,
      },
    });

    return successResponse({
      totalAttempts,
      totalCompleted,
      averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
      bestScore,
      totalPoints,
      currentStreak,
      longestStreak,
      recentAttemptDate: recentAttemptDate
        ? recentAttemptDate.toISOString()
        : null,
      categoryStats,
      recentActivity,
      categories,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
