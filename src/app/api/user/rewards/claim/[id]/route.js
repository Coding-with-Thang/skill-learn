import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(request, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
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
      return new Response("Reward redemption not found or already claimed", {
        status: 404,
      });
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
    return new Response("Internal server error", { status: 500 });
  }
}
