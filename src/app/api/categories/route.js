import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { handleApiError } from "@/utils/errorHandler";

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

    if (!categories) {
      return NextResponse.json({ categories: [] });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}
