import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        categoryStats: {
          select: {
            attempts: true,
            completed: true,
            averageScore: true,
          },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const totalAttempts = user.categoryStats.reduce(
          (sum, stat) => sum + stat.attempts,
          0
        );

        if (totalAttempts === 0) return null;

        // Calculate weighted average score across all categories
        const weightedScore = user.categoryStats.reduce(
          (sum, stat) => sum + (stat.averageScore || 0) * stat.attempts,
          0
        );
        const averageScore = weightedScore / totalAttempts;

        // Calculate completion rate
        const totalCompleted = user.categoryStats.reduce(
          (sum, stat) => sum + stat.completed,
          0
        );
        const completionRate = (totalCompleted / totalAttempts) * 100;

        // Format display name
        const displayName =
          user.username ||
          (user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || "Anonymous");

        return {
          id: user.id,
          username: displayName,
          imageUrl: user.imageUrl,
          averageScore: Number(averageScore.toFixed(2)),
          quizzesTaken: totalAttempts,
          quizzesCompleted: totalCompleted,
          completionRate: Number(completionRate.toFixed(2)),
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 100); // Get top 100

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching quiz score leaderboard:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: error.message },
      { status: 500 }
    );
  }
}
