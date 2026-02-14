import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

export async function GET(_request: NextRequest) {
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

    // Get points history
    const history = await prisma.pointLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 entries
      select: {
        id: true,
        amount: true,
        reason: true,
        createdAt: true,
      },
    });

    // Get points summary
    const summary = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        points: true,
        lifetimePoints: true,
      },
    });

    // Get today's points
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysPoints = await prisma.pointLog.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return successResponse({
      history,
      summary: {
        currentPoints: summary?.points || 0,
        lifetimePoints: summary?.lifetimePoints || 0,
        todaysPoints: todaysPoints._sum.amount || 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
