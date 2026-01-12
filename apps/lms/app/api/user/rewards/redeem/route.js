import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { rewardRedeemed } from "@skill-learn/lib/utils/auditLogger.js";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { rewardRedeemSchema } from "@/lib/zodSchemas";

export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { rewardId } = await validateRequestBody(request, rewardRedeemSchema);

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
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    if (!reward) {
      throw new AppError("Reward not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    if (!reward.enabled) {
      throw new AppError("Reward not available", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    if (user.points < reward.cost) {
      throw new AppError("Insufficient points", ErrorType.VALIDATION, {
        status: 400,
      });
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
        throw new AppError(
          "You have already redeemed this reward",
          ErrorType.VALIDATION,
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
        throw new AppError(
          `You have reached the maximum redemptions (${reward.maxRedemptions}) for this reward`,
          ErrorType.VALIDATION,
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

    // Log audit event
    await rewardRedeemed(user.id, rewardId, reward.prize, reward.cost);

    return successResponse({
      message: `Successfully redeemed ${reward.prize}`,
      remainingPoints: result.updatedPoints,
      redemptionId: result.rewardLog.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
