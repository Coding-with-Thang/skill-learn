import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

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
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Get user's quiz attempts and stats
    const categoryStats = await prisma.categoryStat.findMany({
      where: { userId: user.id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Calculate average score
    const scores = categoryStats
      .map((stat) => stat.averageScore)
      .filter((s): s is number => s != null);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Find best and weakest categories
    const categoriesWithScores = categoryStats
      .filter((stat) => stat.averageScore !== null)
      .map((stat) => ({
        name: stat.category.name,
        score: Math.round(stat.averageScore ?? 0),
      }));

    const bestCategory =
      categoriesWithScores.length > 0
        ? categoriesWithScores.reduce((a, b) => (a.score > b.score ? a : b))
        : { name: "N/A", score: 0 };

    const weakestCategory =
      categoriesWithScores.length > 0
        ? categoriesWithScores.reduce((a, b) => (a.score < b.score ? a : b))
        : { name: "N/A", score: 0 };

    // Calculate category progress
    const categoryProgress = categoryStats.map((stat) => ({
      name: stat.category.name,
      progress: Math.round((stat.completed / (stat.attempts || 1)) * 100),
    }));

    // Calculate score trend (mock data for now)
    const scoreTrend = 0;

    // Calculate activity metrics (mock data for now)
    const mostActiveTime = "2PM - 4PM";
    const avgSessionTime = 25;
    const weeklyActivity = 4;

    return successResponse({
      averageScore,
      scoreTrend,
      bestCategory,
      weakestCategory,
      mostActiveTime,
      avgSessionTime,
      weeklyActivity,
      categoryProgress,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
