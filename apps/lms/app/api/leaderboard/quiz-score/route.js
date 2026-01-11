import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    // Get current user's tenantId
    const { userId } = await auth();
    let tenantId = null;

    if (userId) {
      const currentUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { tenantId: true },
      });
      tenantId = currentUser?.tenantId || null;
    }

    // Build query with tenant filter
    const whereClause = tenantId ? { tenantId } : { tenantId: null };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        categoryStats: {
          where: tenantId ? { tenantId } : { tenantId: null },
          select: {
            attempts: true,
            completed: true,
            averageScore: true,
          },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const totalAttempts = user.categoryStats.reduce(
          (sum, stat) => sum + stat.attempts,
          0
        );

        if (totalAttempts === 0) return null;

        // Calculate weighted average score across all categories
        const weightedScore = user.categoryStats.reduce(
          (sum, stat) => sum + (stat.averageScore || 0) * stat.attempts,
          0
        );
        const averageScore = weightedScore / totalAttempts;

        // Calculate completion rate
        const totalCompleted = user.categoryStats.reduce(
          (sum, stat) => sum + stat.completed,
          0
        );
        const completionRate = (totalCompleted / totalAttempts) * 100;

        // Format display name
        const displayName =
          user.username ||
          (user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.lastName || "Anonymous");

        return {
          id: user.id,
          username: displayName,
          imageUrl: user.imageUrl,
          averageScore: Number(averageScore.toFixed(2)),
          quizzesTaken: totalAttempts,
          quizzesCompleted: totalCompleted,
          completionRate: Number(completionRate.toFixed(2)),
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 100) // Get top 100
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return successResponse({ leaderboard });
  } catch (error) {
    return handleApiError(error);
  }
}
