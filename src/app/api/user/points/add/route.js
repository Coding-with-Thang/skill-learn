import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { pointsAwarded } from "@/lib/utils/auditLogger";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/errorHandler";
import { awardPoints } from "@/lib/actions/points";
import { successResponse } from "@/lib/utils/apiWrapper";
import { validateRequestBody } from "@/lib/utils/validateRequest";
import { addPointsSchema } from "@/lib/zodSchemas";

export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { amount, reason } = await validateRequestBody(request, addPointsSchema);

    // Use awardPoints function which enforces daily limit
    const result = await awardPoints(amount, reason, request);

    await pointsAwarded(userId, result.awarded, reason);

    return successResponse({
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
