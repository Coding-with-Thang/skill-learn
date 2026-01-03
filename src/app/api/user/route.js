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

    // Find the user in the db
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    return successResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
