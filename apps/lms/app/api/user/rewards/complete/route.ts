import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { getLocaleFromRequest } from "@/lib/localeFromRequest";
import { localizeReward } from "@/lib/localize";

/**
 * Combined rewards endpoint that returns both available rewards and user's reward history
 * Replaces the need for separate calls to /user/rewards and /user/rewards/history
 * Pass ?locale=fr or x-locale header for localized prize/description.
 */
export async function GET(request: NextRequest) {
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

    const locale = getLocaleFromRequest(request);

    const [rewards, history] = await Promise.all([
      prisma.reward.findMany({
        where: whereClause,
        select: {
          id: true,
          prize: true,
          prizeJson: true,
          description: true,
          descriptionJson: true,
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
              prizeJson: true,
              description: true,
              descriptionJson: true,
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
            err instanceof Error ? err.message : err
          );
        }
        const withImage = { ...reward, imageUrl };
        return localizeReward(withImage, locale);
      })
    );

    // Resolve signed URLs for reward images in history
    const historyWithImages = await Promise.all(
      history.map(async (log) => {
        if (log.reward?.fileKey) {
          try {
            const signedUrl = await getSignedUrl(log.reward.fileKey, 7);
            if (signedUrl) (log.reward as { imageUrl?: string }).imageUrl = signedUrl;
          } catch (err) {
            console.warn(
              "Failed to generate signed URL for reward image in history:",
              (log as { rewardId?: string }).rewardId ?? "unknown",
              err instanceof Error ? err.message : err
            );
          }
        }
        return log;
      })
    );

    // Localize reward names in history
    const historyWithLocalizedRewards = historyWithImages.map((log) => {
      if (log.reward) {
        const rewardWithJson = {
          ...log.reward,
          prizeJson: (log.reward as { prizeJson?: unknown }).prizeJson,
          descriptionJson: (log.reward as { descriptionJson?: unknown }).descriptionJson,
        };
        const localized = localizeReward(rewardWithJson as Record<string, unknown>, locale);
        return { ...log, reward: localized };
      }
      return log;
    });

    return successResponse({
      rewards: rewardsWithImages || [],
      history: historyWithLocalizedRewards || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
