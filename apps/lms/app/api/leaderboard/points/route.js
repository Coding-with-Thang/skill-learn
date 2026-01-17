import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getTenantId, buildTenantOnlyFilter } from "@skill-learn/lib/utils/tenant.js";

export async function GET(request) {
  try {
    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // Build query with tenant filter (tenant-only, no global content for leaderboards)
    const whereClause = buildTenantOnlyFilter(tenantId);

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
