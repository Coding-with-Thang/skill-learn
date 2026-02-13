import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import type { RouteContext } from "@/types";

type ClaimIdParams = { id: string };

export async function POST(
  _request: NextRequest,
  { params }: RouteContext<ClaimIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Use findUnique for unique identifier lookup
    const redemption = await prisma.rewardLog.findUnique({
      where: { id },
      include: {
        reward: true,
      },
    });

    if (!redemption) {
      throw new AppError("Reward redemption not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Validate state after fetching
    if (redemption.userId !== user.id) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 403 });
    }

    if (!redemption.redeemed) {
      throw new AppError(
        "Reward redemption has not been redeemed yet",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    if (redemption.claimed) {
      throw new AppError(
        "Reward redemption has already been claimed",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    // Update the redemption as claimed
    const updatedRedemption = await prisma.rewardLog.update({
      where: { id },
      data: {
        claimed: true,
        claimUrl: redemption.reward.claimUrl,
        claimedAt: new Date(),
      },
    });

    return successResponse({ redemption: updatedRedemption });
  } catch (error) {
    return handleApiError(error);
  }
}
