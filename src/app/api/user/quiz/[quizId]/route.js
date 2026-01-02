import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

/**
 * GET /api/user/quiz/:quizId
 * Fetches a quiz with all questions and options for authenticated users
 */
export async function GET(req, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { quizId } = await params;
    if (!quizId) {
      throw new AppError("Quiz ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
        isActive: true, // Only fetch active quizzes
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        timeLimit: true,
        passingScore: true,
        categoryId: true,
        questions: {
          select: {
            id: true,
            text: true,
            imageUrl: true,
            videoUrl: true,
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    return successResponse({ quiz });
  } catch (error) {
    return handleApiError(error);
  }
}

