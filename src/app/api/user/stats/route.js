import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    // Verify database connection
    await prisma.$connect();

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

    // Get user points (if available)
    const userWithPoints = await prisma.user.findUnique({
      where: { id: user.id },
      select: { points: true },
    });
    const totalPoints = userWithPoints?.points || 0;

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

    // Get quiz stats based on category stats
    const quizStats = categoryStatsRaw
      .map((stat) => ({
        attempts: stat.attempts,
        completed: stat.completed,
        averageScore: stat.averageScore,
        bestScore: stat.bestScore,
        lastAttempt: stat.lastAttempt,
        createdAt: stat.createdAt,
        category: {
          id: stat.category.id,
          name: stat.category.name,
        },
      }))
      .sort((a, b) => {
        if (!a.lastAttempt) return 1;
        if (!b.lastAttempt) return -1;
        return new Date(b.lastAttempt) - new Date(a.lastAttempt);
      });

    // Get all categories for filtering
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
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
      recentAttemptDate: recentAttemptDate
        ? recentAttemptDate.toISOString()
        : null,
      categoryStats,
      quizStats,
      categories,
    });
  } catch (error) {
    return handleApiError(error);
  } finally {
    await prisma.$disconnect();
  }
}
