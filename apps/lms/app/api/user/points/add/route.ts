import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { pointsAwarded } from "@skill-learn/lib/utils/auditLogger";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { awardPoints } from "@/lib/points";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { addPointsSchema } from "@/lib/zodSchemas";

export async function POST(request: NextRequest) {
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
