import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      .filter(Boolean);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Find best and weakest categories
    const categoriesWithScores = categoryStats
      .filter((stat) => stat.averageScore !== null)
      .map((stat) => ({
        name: stat.category.name,
        score: Math.round(stat.averageScore),
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

    return NextResponse.json({
      success: true,
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
    console.error("Error fetching performance stats:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
