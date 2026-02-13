import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

/**
 * Combined rewards endpoint that returns both available rewards and user's reward history
 * Replaces the need for separate calls to /user/rewards and /user/rewards/history
 */
export async function GET(_request: NextRequest) {
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

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter rewards by tenant or global content
    const whereClause = buildTenantContentFilter(tenantId, {
      enabled: true,
    });

    // Fetch both rewards and history in parallel
    const [rewards, history] = await Promise.all([
      // Get all available rewards
      prisma.reward.findMany({
        where: whereClause,
        select: {
          id: true,
          prize: true,
          description: true,
          cost: true,
          imageUrl: true,
          fileKey: true,
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
              fileKey: true,
              claimUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Resolve signed URLs for reward images (fileKey)
    const rewardsWithImages = await Promise.all(
      rewards.map(async (reward) => {
        let imageUrl = reward.imageUrl || null;
        try {
          if (reward.fileKey) {
            const signedUrl = await getSignedUrl(reward.fileKey, 7);
            if (signedUrl) imageUrl = signedUrl;
          }
        } catch (err) {
          console.warn(
            "Failed to generate signed URL for reward image:",
            reward.id,
            err?.message || err
          );
        }
        return { ...reward, imageUrl };
      })
    );

    // Resolve signed URLs for reward images in history
    const historyWithImages = await Promise.all(
      history.map(async (log) => {
        if (log.reward?.fileKey) {
          try {
            const signedUrl = await getSignedUrl(log.reward.fileKey, 7);
            if (signedUrl) log.reward.imageUrl = signedUrl;
          } catch (err) {
            console.warn(
              "Failed to generate signed URL for reward image in history:",
              log.reward.id,
              err?.message || err
            );
          }
        }
        return log;
      })
    );

    return successResponse({
      rewards: rewardsWithImages || [],
      history: historyWithImages || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
