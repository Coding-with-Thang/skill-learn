import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";

/**
 * Combined rewards endpoint that returns both available rewards and user's reward history
 * Replaces the need for separate calls to /user/rewards and /user/rewards/history
 */
export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    // Get user ID from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Fetch both rewards and history in parallel
    const [rewards, history] = await Promise.all([
      // Get all available rewards
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
        orderBy: {
          cost: "asc",
        },
      }),
      // Get user's reward history
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
      }),
    ]);

    return successResponse({
      rewards: rewards || [],
      history: history || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
