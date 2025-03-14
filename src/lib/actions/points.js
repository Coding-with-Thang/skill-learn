import prisma from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";

export async function getDailyPointStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  //Get user from DB
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

  if (!user) {
    //Create user if they don't exist
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        lifetimePoints: 0,
      },
      include: {
        pointLogs: true,
      },
    });

    return {
      user: newUser,
      todaysPoints: 0,
      canEarnPoints: true,
      lifetimePoints: 0,
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

  return {
    user,
    todaysPoints,
    canEarnPoints: todaysPoints < 100,
    lifetimePoints: user.lifetimePoints,
    todaysLogs,
  };
}

export async function awardDailyPoints(amount, reason) {
  if (amount <= 0 || amount > 100) {
    throw new Error("Invalid point amount");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const status = await getDailyPointStatus();

  if (!status.canEarnPoints) {
    throw new Error("Daily point limit reached");
  }

  //Calculate how many points can be awarded
  const pointsToAward = Math.min(amount, 100 - status.todaysPoints);
  console.log("pointsToAward", pointsToAward);
  //Update user and create log
  const updatedUser = await prisma.user.update({
    where: { clerkId: userId },
    data: {
      lifetimePoints: { increment: pointsToAward },
      pointLogs: {
        create: {
          amount: pointsToAward,
          reason,
        },
      },
    },
  });

  return {
    awarded: pointsToAward,
    newTotal: updatedUser.lifetimePoints,
  };
}
