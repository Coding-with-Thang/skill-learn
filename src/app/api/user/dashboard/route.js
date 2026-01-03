import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { getDailyPointStatus } from "@/lib/actions/points";
import { updateStreak, getStreakInfo } from "@/lib/actions/streak";

/**
 * Combined dashboard endpoint that returns user points, daily status, and streak data
 * Replaces the need for separate calls to /user/points/daily-status and /user/streak
 */
export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    // Fetch both in parallel on server for better performance
    const [pointsData, streakData] = await Promise.all([
      getDailyPointStatus(request),
      Promise.all([
        updateStreak(userId),
        getStreakInfo(userId),
      ]).then(([updated, info]) => ({
        ...updated,
        ...info,
      })),
    ]);

    // Extract user points from pointsData
    const user = pointsData?.user || {};
    
    return successResponse({
      points: user.points || 0,
      lifetimePoints: user.lifetimePoints || 0,
      dailyStatus: {
        todaysPoints: pointsData.todaysPoints || 0,
        canEarnPoints: pointsData.canEarnPoints !== false,
        dailyLimit: pointsData.dailyLimit || 0,
        todaysLogs: pointsData.todaysLogs || [],
      },
      streak: {
        current: streakData.currentStreak || streakData.current || 0,
        longest: streakData.longestStreak || streakData.longest || 0,
        atRisk: streakData.streakAtRisk || streakData.atRisk || false,
        nextMilestone: streakData.nextMilestone || 5,
        pointsToNextMilestone: streakData.pointsToNextMilestone || 5,
        streakUpdated: streakData.streakUpdated || false,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

