import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";

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

    return successResponse({ history });
  } catch (error) {
    return handleApiError(error);
  }
}
