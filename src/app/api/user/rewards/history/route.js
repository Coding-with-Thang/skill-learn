import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const history = await prisma.rewardLog.findMany({
      where: { userId: user.id },
      include: {
        reward: {
          select: {
            prize: true,
            description: true,
            imageUrl: true,
            claimUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
