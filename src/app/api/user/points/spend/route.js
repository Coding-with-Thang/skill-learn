import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";
import { validateRequestBody } from "@/utils/validateRequest";
import { spendPointsSchema } from "@/lib/zodSchemas";

export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { amount, reason } = await validateRequestBody(request, spendPointsSchema);

    // Check if user has enough points
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, points: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    if (user.points < amount) {
      throw new AppError("Insufficient points", ErrorType.VALIDATION, {
        status: 400,
        details: { points: user.points },
      });
    }

    // Transaction to update points and create log
    const result = await prisma.$transaction(async (tx) => {
      // Update user points
      const updatedUser = await tx.user.update({
        where: { clerkId: userId },
        data: {
          points: { decrement: amount },
        },
        select: { id: true, points: true, lifetimePoints: true },
      });

      // Create point log for spending (negative amount)
      await tx.pointLog.create({
        data: {
          userId: updatedUser.id,
          amount: -amount,
          reason: `points_spent_${reason}`,
        },
      });

      return updatedUser;
    });

    return successResponse({
      points: result.points,
      lifetimePoints: result.lifetimePoints,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
