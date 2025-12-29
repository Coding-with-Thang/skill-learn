import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

export async function POST(request, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Find the redemption and check if it can be claimed
    const redemption = await prisma.rewardLog.findFirst({
      where: {
        id,
        userId: user.id,
        redeemed: true,
        claimed: false,
      },
      include: {
        reward: true,
      },
    });

    if (!redemption) {
      throw new AppError(
        "Reward redemption not found or already claimed",
        ErrorType.NOT_FOUND,
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      redemption: updatedRedemption,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
