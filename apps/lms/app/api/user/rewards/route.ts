import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

export async function GET(_request: NextRequest) {
  try {
    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter rewards by tenant or global content using standardized utility
    // Pattern: (tenantId = userTenantId OR (isGlobal = true AND tenantId IS NULL))
    const whereClause = buildTenantContentFilter(tenantId);

    const rewards = await prisma.reward.findMany({
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

        return {
          ...reward,
          imageUrl,
        };
      })
    );

    return successResponse({ rewards: rewardsWithImages });
  } catch (error) {
    return handleApiError(error);
  }
}
