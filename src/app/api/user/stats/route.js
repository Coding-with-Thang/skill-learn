import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Get all active quizzes
    const allQuizzes = await prisma.quiz.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        category: {
          name: "asc",
        },
      },
    });

    // Get user's quiz attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      select: {
        quizId: true,
        attempts: true,
        completed: true,
        bestScore: true,
        averageScore: true,
        lastAttempt: true,
      },
    });

    // Combine the data
    const quizStats = allQuizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      category: quiz.category,
      attempts:
        quizAttempts.find((attempt) => attempt.quizId === quiz.id)?.attempts ||
        0,
      completed:
        quizAttempts.find((attempt) => attempt.quizId === quiz.id)?.completed ||
        0,
      bestScore:
        quizAttempts.find((attempt) => attempt.quizId === quiz.id)?.bestScore ||
        null,
      averageScore:
        quizAttempts.find((attempt) => attempt.quizId === quiz.id)
          ?.averageScore || null,
      lastAttempt:
        quizAttempts.find((attempt) => attempt.quizId === quiz.id)
          ?.lastAttempt || null,
    }));

    // Get categories for filtering
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Get existing stats data
    const categoryStats = await prisma.categoryStat.findMany({
      where: { userId: user.id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      categoryStats,
      quizStats,
      categories,
    });
  } catch (error) {
    console.error("Error fetching quiz stats:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
