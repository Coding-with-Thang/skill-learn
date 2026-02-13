import { prisma } from '@skill-learn/database';
import { getAuth } from "@clerk/nextjs/server"; // Change import
import { updateStreak } from "./streak";
import { getSystemSetting } from "./settings";

export async function getDailyPointStatus(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get daily points limit from settings
    const dailyLimit = parseInt(
      await getSystemSetting("DAILY_POINTS_LIMIT"),
      10
    );

    //Get user from DB with detailed logging
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        pointLogs: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    //Get today's date at midnight
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    //Filter logs for today
    const todaysLogs = user.pointLogs.filter(
      (log) => new Date(log.createdAt) >= today
    );

    //Calculate points earned today (only positive amounts - earned points, not spent)
    const todaysPoints = todaysLogs
      .filter((log) => log.amount > 0) // Only count earned points (positive amounts)
      .reduce((sum, log) => sum + log.amount, 0);

    return {
      user,
      todaysPoints,
      canEarnPoints: todaysPoints < dailyLimit,
      lifetimePoints: user.lifetimePoints,
      todaysLogs,
      dailyLimit,
    };
  } catch (error) {
    console.error("Error in getDailyPointStatus:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      cause: error.cause,
    });
    throw error;
  }
}

export async function awardPoints(amount, reason, request = null) {
  if (!amount || typeof amount !== "number") {
    throw new Error("Point amount must be a number");
  }

  const dailyLimit = parseInt(await getSystemSetting("DAILY_POINTS_LIMIT"), 10);

  if (amount <= 0 || amount > dailyLimit) {
    throw new Error(`Point amount must be between 1 and ${dailyLimit}`);
  }

  if (!reason || typeof reason !== "string") {
    throw new Error("Reason must be provided");
  }

  // Get userId from request if provided, otherwise use auth()
  let userId;
  if (request) {
    const { userId: reqUserId } = getAuth(request);
    if (!reqUserId) {
      throw new Error("Authentication required");
    }
    userId = reqUserId;
  } else {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      throw new Error("Authentication required");
    }
    userId = authUserId;
  }

  // Check daily limit status - need to create a mock request if not provided
  let status;
  if (request) {
    status = await getDailyPointStatus(request);
  } else {
    // For server actions, we need to manually check the daily limit
    const dailyLimit = parseInt(await getSystemSetting("DAILY_POINTS_LIMIT"), 10);
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        pointLogs: {
          where: {
            createdAt: { gte: today },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const todaysPoints = user.pointLogs
      .filter((log) => log.amount > 0)
      .reduce((sum, log) => sum + log.amount, 0);

    status = {
      user,
      todaysPoints,
      canEarnPoints: todaysPoints < dailyLimit,
      dailyLimit,
    };
  }

  if (!status.canEarnPoints) {
    throw new Error("Daily point limit reached");
  }

  const pointsToAward = Math.min(
    amount,
    status.dailyLimit - status.todaysPoints
  );

  if (pointsToAward <= 0) {
    throw new Error("Daily point limit reached");
  }

  try {
    // Use transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // First, verify user exists and get current points
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, points: true, lifetimePoints: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Create point log entry
      const pointLog = await tx.pointLog.create({
        data: {
          userId: user.id,
          amount: pointsToAward,
          reason,
        },
      });

      // Update user points (both current and lifetime)
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          points: { increment: pointsToAward },
          lifetimePoints: { increment: pointsToAward },
        },
        select: { id: true, points: true, lifetimePoints: true },
      });

      // Update streak
      await updateStreak(userId);

      return {
        awarded: pointsToAward,
        points: updatedUser.points,
        lifetimePoints: updatedUser.lifetimePoints,
        logId: pointLog.id,
      };
    });

    return result;
  } catch (error) {
    console.error("Point award error:", error);
    throw new Error(`Failed to award points: ${error.message}`);
  }
}
