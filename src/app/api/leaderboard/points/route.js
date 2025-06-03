import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
      },
      orderBy: {
        points: "desc",
      },
      take: 100,
    });

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      totalPoints: user.points,
      rank: index + 1,
    }));

    return NextResponse.json(rankedLeaderboard);
  } catch (error) {
    console.error("Error fetching points leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
