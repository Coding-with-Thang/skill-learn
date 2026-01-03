import prisma from "@/lib/utils/connect";
import { handleApiError } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return successResponse({ categories: categories || [] });
  } catch (error) {
    return handleApiError(error);
  }
}
