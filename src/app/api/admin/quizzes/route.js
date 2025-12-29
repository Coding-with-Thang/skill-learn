import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function GET(request) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }    // Fetch all quizzes with their categories and question count
    const quizzes = await prisma.quiz.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            isActive: true,
          },
        },
        questions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse({ quizzes });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.categoryId) {
      throw new AppError("Missing required fields", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    // Create new quiz with default questions and options
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || 70,
        isActive: data.isActive ?? true,
        questions: {
          create: (data.questions || Array(5).fill(null).map((_, i) => ({
            text: `Question ${i + 1}`,
            points: 1,
            options: {
              create: Array(4).fill(null).map((_, j) => ({
                text: `Option ${j + 1}`,
                isCorrect: j === 0 // First option is correct by default
              }))
            }
          })))
        }
      },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    return successResponse({ quiz });
  } catch (error) {
    return handleApiError(error);
  }
}
