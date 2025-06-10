import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(req, { params }) {
  try {
    // Get auth session asynchronously
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId } = await params;
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json(
      stats || {
        attempts: 0,
        completed: 0,
        averageScore: null,
        bestScore: null,
        lastAttempt: null,
      }
    );
  } catch (error) {
    console.error("Error fetching quiz stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
