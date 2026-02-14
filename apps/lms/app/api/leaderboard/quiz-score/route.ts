import { type NextRequest } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantOnlyFilter } from "@skill-learn/lib/utils/tenant";

export async function GET(_request: NextRequest) {
  try {
    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // Build query with tenant filter (tenant-only, no global content for leaderboards)
    const whereClause = buildTenantOnlyFilter(tenantId);

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        categoryStats: {
          where: {
            category: tenantId
              ? { tenantId }
              : { tenantId: null },
          },
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
      .filter((e): e is NonNullable<typeof e> => e != null)
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
