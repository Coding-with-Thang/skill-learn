import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        quizResults: {
          select: {
            score: true,
          },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const totalQuizzes = user.quizResults.length;
        if (totalQuizzes === 0) return null;

        const totalScore = user.quizResults.reduce(
          (sum, result) => sum + result.score,
          0
        );
        const averageScore = (totalScore / totalQuizzes) * 100;

        return {
          id: user.id,
          name: user.name,
          image: user.image,
          averageScore,
          quizzesTaken: totalQuizzes,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 100);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching quiz score leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
