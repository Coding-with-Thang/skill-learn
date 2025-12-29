import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "Reward redemption not found or already claimed" },
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
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
