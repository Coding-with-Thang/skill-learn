import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

// Get a single quiz with all details
export async function GET(request, { params }) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "OPERATIONS") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Update a quiz
export async function PUT(request, { params }) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "OPERATIONS") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }    // Update quiz and manage questions
    let quiz = await prisma.quiz.update({
      where: { id: params.quizId },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || 70,
        isActive: data.isActive ?? true,
      },
    });

    // Handle questions if provided
    if (data.questions) {
      // Delete existing questions (cascade deletes options)
      await prisma.question.deleteMany({
        where: { quizId: params.quizId },
      });

      // Create new questions with options
      for (const question of data.questions) {
        const createdQuestion = await prisma.question.create({
          data: {
            text: question.text,
            imageUrl: question.imageUrl,
            videoUrl: question.videoUrl,
            points: question.points || 1,
            quizId: params.quizId,
            options: {
              create: question.options.map(opt => ({
                text: opt.text,
                isCorrect: opt.isCorrect
              }))
            }
          }
        });
      }
    }

    // Return updated quiz with all relations
    quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete a quiz
export async function DELETE(request, { params }) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "OPERATIONS") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete quiz and all related data (questions and options will be deleted automatically due to cascade)
    await prisma.quiz.delete({
      where: { id: params.quizId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
