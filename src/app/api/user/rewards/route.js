import prisma from "@/lib/utils/connect";
import { handleApiError } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { getSignedUrl } from "@/lib/utils/adminStorage";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
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
            err?.message || err
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
