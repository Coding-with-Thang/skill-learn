import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      throw new AppError("Unauthorized - No user found", ErrorType.AUTH, {
        status: 401,
      });
    }

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
    return NextResponse.json({
      success: true,
      points: dbUser.points,
      lifetimePoints: dbUser.lifetimePoints,
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
