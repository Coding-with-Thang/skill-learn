import prisma from "@/utils/connect";

export async function updateStreak(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
        streakUpdatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if already updated today
    if (user.streakUpdatedAt && isSameDay(user.streakUpdatedAt, today)) {
      return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        streakUpdated: false,
      };
    }

    let newStreak = user.currentStreak;

    // If last streak date was yesterday, increment streak
    if (user.lastStreakDate && isSameDay(user.lastStreakDate, yesterday)) {
      newStreak += 1;
    }
    // If last streak date was not yesterday, reset streak to 1
    else if (!isSameDay(user.lastStreakDate, today)) {
      newStreak = 1;
    }

    // Update user streak data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak || 0),
        lastStreakDate: today,
        streakUpdatedAt: now,
      },
      select: {
        currentStreak: true,
        longestStreak: true,
      },
    });

    return {
      ...updatedUser,
      streakUpdated: true,
    };
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
}

export async function getStreakInfo(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if streak is at risk (last activity was yesterday)
    const streakAtRisk =
      user.lastStreakDate && isSameDay(user.lastStreakDate, yesterday);

    // Calculate next milestone (next multiple of 5)
    const nextMilestone = Math.ceil((user.currentStreak + 1) / 5) * 5;
    const pointsToNextMilestone = nextMilestone - user.currentStreak;

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakAtRisk,
      nextMilestone,
      pointsToNextMilestone,
    };
  } catch (error) {
    console.error("Error getting streak info:", error);
    throw error;
  }
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
