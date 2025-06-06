import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

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
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "There was an error getting Categories", categories: [] },
      { status: 500 }
    );
  }
}
