import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { startOfWeek, endOfWeek, format } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
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

    // Get quiz attempts for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        quiz: {
          select: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average score and trend
    const averageScore = Math.round(
      quizAttempts.reduce((acc, attempt) => acc + attempt.score, 0) /
        quizAttempts.length || 0
    );

    // Calculate score trend (comparing last 15 days vs previous 15 days)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const recentAttempts = quizAttempts.filter(
      (a) => a.createdAt >= fifteenDaysAgo
    );
    const previousAttempts = quizAttempts.filter(
      (a) => a.createdAt < fifteenDaysAgo
    );

    const recentAvg =
      recentAttempts.reduce((acc, a) => acc + a.score, 0) /
        recentAttempts.length || 0;
    const previousAvg =
      previousAttempts.reduce((acc, a) => acc + a.score, 0) /
        previousAttempts.length || 0;

    const scoreTrend =
      Math.round(((recentAvg - previousAvg) / previousAvg) * 100) || 0;

    // Calculate category performance
    const categoryPerformance = {};
    quizAttempts.forEach((attempt) => {
      const category = attempt.quiz.category;
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = {
          totalScore: 0,
          attempts: 0,
        };
      }
      categoryPerformance[category].totalScore += attempt.score;
      categoryPerformance[category].attempts += 1;
    });

    const categoryProgress = Object.entries(categoryPerformance).map(
      ([name, data]) => ({
        name,
        progress: Math.round(data.totalScore / data.attempts),
      })
    );

    // Find best and weakest categories
    const sortedCategories = [...categoryProgress].sort(
      (a, b) => b.progress - a.progress
    );
    const bestCategory = sortedCategories[0] || { name: "N/A", score: 0 };
    const weakestCategory = sortedCategories[sortedCategories.length - 1] || {
      name: "N/A",
      score: 0,
    };

    // Calculate learning habits
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate most active time
    const hourCounts = {};
    sessions.forEach((session) => {
      const hour = format(new Date(session.createdAt), "HH:00");
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostActiveTime =
      Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Calculate average session time
    const avgSessionTime = Math.round(
      sessions.reduce((acc, session) => acc + session.duration, 0) /
        sessions.length || 0
    );

    // Calculate weekly activity (days active in current week)
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weeklyActivity = new Set(
      sessions
        .filter((s) => s.createdAt >= weekStart && s.createdAt <= weekEnd)
        .map((s) => format(new Date(s.createdAt), "yyyy-MM-dd"))
    ).size;

    return NextResponse.json({
      averageScore,
      scoreTrend,
      bestCategory,
      weakestCategory,
      categoryProgress,
      mostActiveTime,
      avgSessionTime,
      weeklyActivity,
    });
  } catch (error) {
    console.error("Performance stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance stats" },
      { status: 500 }
    );
  }
}
