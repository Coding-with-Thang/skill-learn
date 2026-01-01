import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function GET(req, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { categoryId } = await params;
    if (!categoryId) {
      throw new AppError("Category ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const stats = await prisma.categoryStat.findUnique({
      where: {
        userId_categoryId: {
          userId: user.id,
          categoryId,
        },
      },
      select: {
        attempts: true,
        completed: true,
        averageScore: true,
        bestScore: true,
        lastAttempt: true,
      },
    });

    return successResponse(
      stats || {
        attempts: 0,
        completed: 0,
        averageScore: null,
        bestScore: null,
        lastAttempt: null,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
