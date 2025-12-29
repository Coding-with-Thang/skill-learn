import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { categoryId } = await req.json();
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

    let stat = await prisma.categoryStat.findUnique({
      where: {
        userId_categoryId: {
          categoryId,
          userId: user.id,
        },
      },
    });

    if (!stat) {
      stat = await prisma.categoryStat.create({
        data: {
          userId: user.id,
          categoryId,
          attempts: 1,
          lastAttempt: new Date(),
        },
      });
    } else {
      stat = await prisma.categoryStat.update({
        where: {
          userId_categoryId: {
            userId: user.id,
            categoryId,
          },
        },
        data: {
          attempts: { increment: 1 },
          lastAttempt: new Date(),
        },
      });
    }

    return successResponse({ stat });
  } catch (error) {
    return handleApiError(error);
  }
}
