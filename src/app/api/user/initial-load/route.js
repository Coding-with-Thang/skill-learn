import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { getDailyPointStatus } from "@/lib/actions/points";
import { updateStreak, getStreakInfo } from "@/lib/actions/streak";
import prisma from "@/lib/utils/connect";
import { AppError, ErrorType } from "@/lib/utils/errorHandler";

/**
 * Batch endpoint for initial page load data
 * Supports query parameter: ?include=rewards,history,points,streak
 * Fetches only requested data to optimize performance
 */
export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    // Parse include parameter
    const { searchParams } = new URL(request.url);
    const includeParam = searchParams.get("include") || "points,streak";
    const includes = includeParam.split(",").map((s) => s.trim());

    const result = {};

    // Get user from database (needed for most queries)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Build parallel queries based on what's requested
    const queries = [];

    if (includes.includes("points") || includes.includes("dashboard")) {
      queries.push(
        getDailyPointStatus(request).then((pointsData) => ({
          key: "points",
          data: {
            points: pointsData?.user?.points || 0,
            lifetimePoints: pointsData?.user?.lifetimePoints || 0,
            dailyStatus: {
              todaysPoints: pointsData.todaysPoints || 0,
              canEarnPoints: pointsData.canEarnPoints !== false,
              dailyLimit: pointsData.dailyLimit || 0,
              todaysLogs: pointsData.todaysLogs || [],
            },
          },
        }))
      );
    }

    if (includes.includes("streak") || includes.includes("dashboard")) {
      queries.push(
        Promise.all([
          updateStreak(userId),
          getStreakInfo(userId),
        ]).then(([updated, info]) => ({
          key: "streak",
          data: {
            current: updated.currentStreak || 0,
            longest: updated.longestStreak || 0,
            atRisk: info.streakAtRisk || false,
            nextMilestone: info.nextMilestone || 5,
            pointsToNextMilestone: info.pointsToNextMilestone || 5,
            streakUpdated: updated.streakUpdated || false,
          },
        }))
      );
    }

    if (includes.includes("rewards")) {
      queries.push(
        prisma.reward.findMany({
          select: {
            id: true,
            prize: true,
            description: true,
            cost: true,
            imageUrl: true,
            featured: true,
            enabled: true,
            allowMultiple: true,
            maxRedemptions: true,
          },
          orderBy: { cost: "asc" },
        }).then((rewards) => ({
          key: "rewards",
          data: rewards || [],
        }))
      );
    }

    if (includes.includes("history")) {
      queries.push(
        prisma.rewardLog.findMany({
          where: { userId: user.id },
          include: {
            reward: {
              select: {
                prize: true,
                description: true,
                imageUrl: true,
                claimUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }).then((history) => ({
          key: "history",
          data: history || [],
        }))
      );
    }

    // Execute all queries in parallel
    const results = await Promise.all(queries);

    // Combine results into response object
    results.forEach(({ key, data }) => {
      result[key] = data;
    });

    // If dashboard was requested, combine points and streak
    if (includes.includes("dashboard")) {
      result.dashboard = {
        points: result.points?.points || 0,
        lifetimePoints: result.points?.lifetimePoints || 0,
        dailyStatus: result.points?.dailyStatus,
        streak: result.streak,
      };
    }

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

