import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getSystemSetting } from "@/lib/actions/settings";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { quizCreateSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage.js";

export async function GET(request) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    } // Fetch all quizzes with their categories and question count
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

    // Resolve signed URLs for quiz images (fileKey). If unavailable, use existing imageUrl
    const quizzesWithImages = await Promise.all(
      quizzes.map(async (quiz) => {
        let imageUrl = quiz.imageUrl || null;
        try {
          if (quiz.fileKey) {
            const signedUrl = await getSignedUrl(quiz.fileKey, 7);
            if (signedUrl) imageUrl = signedUrl;
          }
        } catch (err) {
          console.warn(
            "Failed to generate signed URL for quiz image:",
            quiz.id,
            err?.message || err
          );
        }

        return {
          ...quiz,
          imageUrl,
        };
      })
    );

    return successResponse({ quizzes: quizzesWithImages });
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

    const data = await validateRequestBody(request, quizCreateSchema);

    // Get default passing score from settings
    const defaultPassingScore = parseInt(
      await getSystemSetting("DEFAULT_PASSING_SCORE"),
      10
    );

    // Create new quiz with default questions and options
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        fileKey: data.fileKey,
        categoryId: data.categoryId,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || defaultPassingScore,
        isActive: data.isActive ?? true,
        showQuestionReview: data.showQuestionReview ?? true,
        showCorrectAnswers: data.showCorrectAnswers ?? false,
        questions: {
          create:
            data.questions ||
            Array(QUIZ_CONFIG.DEFAULT_QUESTIONS_COUNT)
              .fill(null)
              .map((_, i) => ({
                text: `Question ${i + 1}`,
                points: 1,
                fileKey: null,
                options: {
                  create: Array(4)
                    .fill(null)
                    .map((_, j) => ({
                      text: `Option ${j + 1}`,
                      isCorrect: j === 0, // First option is correct by default
                    })),
                },
              })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    // Generate signed URL if fileKey exists
    let imageUrl = quiz.imageUrl || null;
    try {
      if (quiz.fileKey) {
        const signedUrl = await getSignedUrl(quiz.fileKey, 7);
        if (signedUrl) imageUrl = signedUrl;
      }
    } catch (err) {
      console.warn(
        "Failed to generate signed URL for quiz image:",
        err?.message || err
      );
    }

    return successResponse({ 
      quiz: { 
        ...quiz, 
        imageUrl 
      } 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
