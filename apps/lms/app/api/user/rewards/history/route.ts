import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";

export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const history = await prisma.rewardLog.findMany({
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
    });

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
              (log as { rewardId?: string }).rewardId ?? "unknown",
              err instanceof Error ? err.message : err
            );
          }
        }
        return log;
      })
    );

    return successResponse({ history: historyWithImages });
  } catch (error) {
    return handleApiError(error);
  }
}
