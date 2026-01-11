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

    const leaderboard = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        imageUrl: true,
        points: true,
      },
      orderBy: {
        points: "desc",
      },
      take: 100,
    });

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      totalPoints: user.points,
      rank: index + 1,
    }));

    return successResponse({ leaderboard: rankedLeaderboard });
  } catch (error) {
    return handleApiError(error);
  }
}
