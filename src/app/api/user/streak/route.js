import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getStreakInfo, updateStreak } from "@/lib/actions/streak";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    console.log("userId", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user found" },
        { status: 401 }
      );
    }

    // Update streak first
    await updateStreak(userId);

    // Get streak info
    const streakInfo = await getStreakInfo(userId);

    return NextResponse.json(streakInfo);
  } catch (error) {
    console.error("Error in streak API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
