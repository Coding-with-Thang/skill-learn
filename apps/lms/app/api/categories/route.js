import { prisma } from "@skill-learn/database";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

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
