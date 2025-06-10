import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      console.log("No userId found in auth session");
      return NextResponse.json(
        { error: "Please sign in to access this resource" },
        { status: 401 }
      );
    }

    // Verify database connection
    await prisma.$connect();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      console.log(`No user found for clerkId: ${userId}`);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get category stats with category information
    const categoryStats = await prisma.categoryStat.findMany({
      where: {
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    // Get quiz stats
    const quizStats = await prisma.quiz.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        score: true,
        totalQuestions: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all categories for filtering
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        categoryStats,
        quizStats,
        categories,
      },
    });
  } catch (error) {
    console.error("Error in /api/user/stats:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
