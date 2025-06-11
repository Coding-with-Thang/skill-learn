import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(request, { params }) {
  try {
    const { categoryId } = params;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    let category;
    try {
      category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          isActive: true,
        },
        include: {
          _count: {
            select: { quizzes: true },
          },
        },
      });
    } catch (prismaError) {
      console.error("Prisma query error:", prismaError);
      return NextResponse.json(
        { error: "Invalid category ID format" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
