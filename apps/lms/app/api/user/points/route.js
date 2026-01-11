import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { requireAuth } from "@/lib/utils/auth";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        points: true,
        lifetimePoints: true,
      },
    });

    if (!dbUser) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    return successResponse({
      points: dbUser.points,
      lifetimePoints: dbUser.lifetimePoints,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
