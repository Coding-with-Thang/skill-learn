import { NextResponse } from "next/server";

export async function GET() {
  try {
    // You can store these values in your database or environment variables
    const quizSettings = {
      dailyPointsLimit: 100000, // Maximum points a user can earn per day
      pointsPerQuestion: 1000, // Base points for each correct answer
      bonusMultiplier: 2, // Multiplier for perfect scores
      passingScoreDefault: 70, // Default passing score percentage
      timeLimit: 30, // Default time limit in minutes
    };

    return NextResponse.json(quizSettings, { status: 200 });
  } catch (error) {
    console.error("Error fetching quiz settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz settings" },
      { status: 500 }
    );
  }
}
