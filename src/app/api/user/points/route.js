import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { requireAuth } from "@/utils/auth";
import { successResponse } from "@/utils/apiWrapper";

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
