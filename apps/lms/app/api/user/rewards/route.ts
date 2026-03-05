import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { getLocaleFromRequest } from "@/lib/localeFromRequest";
import { localizeReward } from "@/lib/localize";

export async function GET(request: NextRequest) {
  try {
    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter rewards by tenant or global content using standardized utility
    // Pattern: (tenantId = userTenantId OR (isGlobal = true AND tenantId IS NULL))
    const whereClause = buildTenantContentFilter(tenantId);

    const locale = getLocaleFromRequest(request);

    const rewards = await prisma.reward.findMany({
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
    });

    // Resolve signed URLs for reward images (fileKey). If unavailable, use existing imageUrl
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

    return successResponse({ rewards: rewardsWithImages });
  } catch (error) {
    return handleApiError(error);
  }
}
