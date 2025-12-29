import prisma from "@/utils/connect";
import { handleApiError } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
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
    });

    return successResponse({ rewards });
  } catch (error) {
    return handleApiError(error);
  }
}
