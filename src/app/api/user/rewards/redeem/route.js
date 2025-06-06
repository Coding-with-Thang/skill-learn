import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rewardId } = await request.json();

    // Get the user and reward
    const [user, reward] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, points: true },
      }),
      prisma.reward.findUnique({
        where: { id: rewardId },
        select: {
          id: true,
          prize: true,
          cost: true,
          enabled: true,
          allowMultiple: true,
          maxRedemptions: true,
        },
      }),
    ]);

    // Validate user and reward
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }
    if (!reward.enabled) {
      return NextResponse.json(
        { error: "Reward not available" },
        { status: 400 }
      );
    }
    if (user.points < reward.cost) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      );
    }

    // Check redemption limits
    if (!reward.allowMultiple) {
      // Check if user has already redeemed this reward
      const existingRedemption = await prisma.rewardLog.findFirst({
        where: {
          userId: user.id,
          rewardId: reward.id,
        },
      });

      if (existingRedemption) {
        return NextResponse.json(
          { error: "You have already redeemed this reward" },
          { status: 400 }
        );
      }
    } else if (reward.maxRedemptions !== null) {
      // Check if user has reached the maximum redemptions
      const redemptionCount = await prisma.rewardLog.count({
        where: {
          userId: user.id,
          rewardId: reward.id,
        },
      });

      if (redemptionCount >= reward.maxRedemptions) {
        return NextResponse.json(
          {
            error: `You have reached the maximum redemptions (${reward.maxRedemptions}) for this reward`,
          },
          { status: 400 }
        );
      }
    }

    // Create redemption in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create reward log
      const rewardLog = await tx.rewardLog.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          pointsSpent: reward.cost,
          redeemed: true,
        },
      });

      // Deduct points from user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          points: { decrement: reward.cost },
        },
        select: { points: true },
      });

      return {
        rewardLog,
        updatedPoints: updatedUser.points,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${reward.prize}`,
      remainingPoints: result.updatedPoints,
      redemptionId: result.rewardLog.id,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
