import prisma from "@/lib/utils/connect";
import { handleApiError } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";

export async function GET(request) {
  try {
    const leaderboard = await prisma.user.findMany({
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
