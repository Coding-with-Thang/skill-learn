import prisma from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";
import { updateStreak } from "./streak";
import { getSystemSetting } from "./settings";

export async function getDailyPointStatus(request) {
  try {
    console.log("Getting daily point status...");
    const { userId } = auth(request);
    console.log("User ID from auth in points.js:", userId);

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get daily points limit from settings
    console.log("Fetching daily points limit from settings...");
    const dailyLimit = parseInt(
      await getSystemSetting("DAILY_POINTS_LIMIT"),
      10
    );
    console.log("Daily points limit:", dailyLimit);

    //Get user from DB
    console.log("Fetching user from database...");
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
    console.log("User found:", user ? "yes" : "no");

    if (!user) {
      console.log("User not found, creating new user...");
      //Create user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          username: `user_${Date.now()}`, // Adding required username field
          firstName: "New",
          lastName: "User",
          lifetimePoints: 0,
          points: 0,
        },
        include: {
          pointLogs: true,
        },
      });
      console.log("New user created:", newUser.id);

      return {
        user: newUser,
        todaysPoints: 0,
        canEarnPoints: true,
        lifetimePoints: 0,
        dailyLimit,
      };
    }

    //Get today's date at midnight
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    //Filter logs for today
    const todaysLogs = user.pointLogs.filter(
      (log) => new Date(log.createdAt) >= today
    );

    //Calculate points earned today
    const todaysPoints = todaysLogs.reduce((sum, log) => sum + log.amount, 0);
    console.log("Points earned today:", todaysPoints);

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

export async function awardPoints(amount, reason) {
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

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const status = await getDailyPointStatus();

  if (!status.canEarnPoints) {
    throw new Error("Daily point limit reached");
  }

  const pointsToAward = Math.min(
    amount,
    status.dailyLimit - status.todaysPoints
  );

  try {
    // Use transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      // First, verify user exists and get current points
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, lifetimePoints: true },
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

      // Update user points
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          lifetimePoints: { increment: pointsToAward },
        },
      });

      // Update streak
      await updateStreak(userId);

      return {
        awarded: pointsToAward,
        newTotal: updatedUser.lifetimePoints,
        logId: pointLog.id,
      };
    });

    return result;
  } catch (error) {
    console.error("Point award error:", error);
    throw new Error(`Failed to award points: ${error.message}`);
  }
}
