import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { requireAdmin } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { getSystemSetting } from "@/lib/actions/settings";
import { validateRequestBody } from "@/lib/utils/validateRequest";
import { quizUpdateSchema } from "@/lib/zodSchemas";

// Get a single quiz with all details
export async function GET(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { quizId } = await validateRequestParams(
      z.object({ quizId: objectIdSchema }),
      params
    );

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    return successResponse({ quiz });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a quiz
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const data = await validateRequestBody(request, quizUpdateSchema);

    // Get default passing score from settings
    const defaultPassingScore = parseInt(await getSystemSetting("DEFAULT_PASSING_SCORE"), 10);

    const { quizId } = await validateRequestParams(
      z.object({ quizId: objectIdSchema }),
      params
    );

    // Update quiz and manage questions
    let quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || defaultPassingScore,
        isActive: data.isActive ?? true,
      },
    });

    // Handle questions if provided
    if (data.questions) {
      // Delete existing questions (cascade deletes options)
      await prisma.question.deleteMany({
        where: { quizId: quizId },
      });

      // Create new questions with options
      for (const question of data.questions) {
        const createdQuestion = await prisma.question.create({
          data: {
            text: question.text,
            imageUrl: question.imageUrl,
            videoUrl: question.videoUrl,
            points: question.points || 1,
            quizId: quizId,
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
      where: { id: quizId },
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

    return successResponse({ quiz });
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a quiz
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { quizId } = await validateRequestParams(
      z.object({ quizId: objectIdSchema }),
      params
    );

    // Delete quiz and all related data (questions and options will be deleted automatically due to cascade)
    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
