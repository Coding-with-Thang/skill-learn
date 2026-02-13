import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from '@skill-learn/database';
import { requireCanEditQuiz } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSystemSetting } from "@/lib/actions/settings";
import { validateRequestBody, validateRequestParams } from "@skill-learn/lib/utils/validateRequest";
import { quizUpdateSchema, objectIdSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import type { RouteContext } from "@/types";

type QuizIdParams = { quizId: string };

// Get a single quiz with all details
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<QuizIdParams>
) {
  try {
    const { quizId } = await validateRequestParams(
      z.object({ quizId: objectIdSchema }),
      params
    );
    const authResult = await requireCanEditQuiz(quizId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const quiz = await prisma.quiz.findFirst({
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

    // If the quiz has a fileKey (uploaded image), generate a signed URL for client preview
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

    // Generate signed URLs for question images if fileKey exists
    if (quiz.questions && Array.isArray(quiz.questions)) {
      for (const question of quiz.questions) {
        if (question.fileKey) {
          try {
            const signedUrl = await getSignedUrl(question.fileKey, 7);
            if (signedUrl) question.imageUrl = signedUrl;
          } catch (err) {
            console.warn(
              "Failed to generate signed URL for question image:",
              question.id,
              err?.message || err
            );
          }
        }
      }
    }

    // Return quiz with imageUrl (either from fileKey signed URL or existing imageUrl)
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

// Update a quiz
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<QuizIdParams>
) {
  try {
    const { quizId } = await validateRequestParams(
      z.object({ quizId: objectIdSchema }),
      params
    );
    const authResult = await requireCanEditQuiz(quizId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { tenantId } = authResult;

    const data = await validateRequestBody(request, quizUpdateSchema);

    // Get default passing score from settings
    const defaultPassingScore = parseInt(await getSystemSetting("DEFAULT_PASSING_SCORE"), 10);

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Update quiz and manage questions
    let quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        fileKey: data.fileKey,
        categoryId: data.categoryId,
        tenantId: data.tenantId !== undefined ? data.tenantId : existingQuiz.tenantId, // Allow admin to change tenant
        isGlobal: data.isGlobal !== undefined ? data.isGlobal : existingQuiz.isGlobal, // Allow admin to change global flag
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || defaultPassingScore,
        isActive: data.isActive ?? true,
        showQuestionReview: data.showQuestionReview,
        showCorrectAnswers: data.showCorrectAnswers,
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
        // Generate signed URL if fileKey exists
        let imageUrl = question.imageUrl || null;
        try {
          if (question.fileKey) {
            const signedUrl = await getSignedUrl(question.fileKey, 7);
            if (signedUrl) imageUrl = signedUrl;
          }
        } catch (err) {
          console.warn(
            "Failed to generate signed URL for question image:",
            err?.message || err
          );
        }

        const createdQuestion = await prisma.question.create({
          data: {
            text: question.text,
            imageUrl: imageUrl,
            fileKey: question.fileKey,
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

    // Generate signed URLs for question images if fileKey exists
    if (quiz.questions && Array.isArray(quiz.questions)) {
      for (const question of quiz.questions) {
        if (question.fileKey) {
          try {
            const signedUrl = await getSignedUrl(question.fileKey, 7);
            if (signedUrl) question.imageUrl = signedUrl;
          } catch (err) {
            console.warn(
              "Failed to generate signed URL for question image:",
              question.id,
              err?.message || err
            );
          }
        }
      }
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

// Delete a quiz
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<QuizIdParams>
) {
  try {
    const { quizId } = await validateRequestParams(
      z.object({ quizId: objectIdSchema }),
      params
    );
    const authResult = await requireCanEditQuiz(quizId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Delete quiz and all related data (questions and options cascade)
    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
