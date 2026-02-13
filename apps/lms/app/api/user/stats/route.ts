import { NextRequest, NextResponse } from "next/server";
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

    // Get category stats with category information
    const categoryStatsRaw = await prisma.categoryStat.findMany({
      where: {
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    // Calculate aggregated stats
    const totalAttempts = categoryStatsRaw.reduce(
      (sum, stat) => sum + (stat.attempts || 0),
      0
    );
    const totalCompleted = categoryStatsRaw.reduce(
      (sum, stat) => sum + (stat.completed || 0),
      0
    );

    // Calculate average score across all categories
    const scoresWithValues = categoryStatsRaw
      .map((stat) => stat.averageScore)
      .filter((score) => score !== null && score !== undefined);
    const averageScore =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, score) => sum + score, 0) /
          scoresWithValues.length
        : 0;

    // Find best score across all categories
    const allBestScores = categoryStatsRaw
      .map((stat) => stat.bestScore)
      .filter((score) => score !== null && score !== undefined);
    const bestScore = allBestScores.length > 0 ? Math.max(...allBestScores) : 0;

    // Find most recent attempt date
    const allLastAttempts = categoryStatsRaw
      .map((stat) => stat.lastAttempt)
      .filter((date) => date !== null);
    const recentAttemptDate =
      allLastAttempts.length > 0
        ? new Date(
            Math.max(...allLastAttempts.map((date) => new Date(date).getTime()))
          )
        : null;

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


    // Transform category stats to match component expectations
    const categoryStats = categoryStatsRaw.map((stat) => ({
      name: stat.category.name,
      attempts: stat.attempts || 0,
      completed: stat.completed || 0,
      averageScore: stat.averageScore || 0,
      bestScore: stat.bestScore || 0,
      lastAttempt: stat.lastAttempt,
      categoryId: stat.categoryId,
    }));

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
