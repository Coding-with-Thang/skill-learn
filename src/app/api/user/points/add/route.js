import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { pointsAwarded } from "@/utils/auditLogger";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { awardPoints } from "@/lib/actions/points";

export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { amount, reason } = await request.json();

    if (!amount || !reason) {
      throw new AppError("Reason and Amount required!", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Use awardPoints function which enforces daily limit
    const result = await awardPoints(amount, reason, request);

    await pointsAwarded(userId, result.awarded, reason);

    return NextResponse.json({
      success: true,
      points: result.points,
      lifetimePoints: result.lifetimePoints,
      awarded: result.awarded,
      message:
        result.awarded < amount
          ? `Daily limit reached. Awarded ${result.awarded} of ${amount} points.`
          : "Points awarded successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
