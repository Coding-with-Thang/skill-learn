import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { getTenantContext } from "@skill-learn/lib/utils/tenant";
import { requireAnyPermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getSystemSetting } from "@/lib/actions/settings";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { quizCreateSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

const QUIZ_LIST_PERMISSIONS = [
  PERMISSIONS.QUIZZES_READ,
  PERMISSIONS.QUIZZES_CREATE,
  PERMISSIONS.QUIZZES_UPDATE,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
];

export async function GET(_request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (context instanceof Response) {
      return context;
    }
    const { tenantId } = context;
    const permResult = await requireAnyPermission(QUIZ_LIST_PERMISSIONS, tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // CRITICAL: Filter quizzes by tenant or global content using standardized utility
    // Pattern: (tenantId = userTenantId OR (isGlobal = true AND tenantId IS NULL))
    const whereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    // Fetch all quizzes with their categories and question count
    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
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

export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (context instanceof Response) {
      return context;
    }
    const { user, tenantId } = context;
    const permResult = await requireAnyPermission(
      [PERMISSIONS.QUIZZES_CREATE, PERMISSIONS.DASHBOARD_ADMIN, PERMISSIONS.DASHBOARD_MANAGER],
      tenantId
    );
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    const data = await validateRequestBody(request, quizCreateSchema);

    // Get default passing score from settings
    const defaultPassingScore = parseInt(
      await getSystemSetting("DEFAULT_PASSING_SCORE"),
      10
    );

    // Build questions in Prisma nested create shape: each question must have options: { create: [...] }
    const questionsPayload = data.questions?.length
      ? data.questions.map((q) => ({
          text: q.text ?? "",
          imageUrl: q.imageUrl ?? null,
          fileKey: q.fileKey ?? null,
          videoUrl: q.videoUrl ?? null,
          points: q.points ?? 1,
          options: {
            create: (q.options || []).map((opt) => ({
              text: opt.text ?? "",
              isCorrect: !!opt.isCorrect,
            })),
          },
        }))
      : Array(QUIZ_CONFIG.DEFAULT_QUESTIONS_COUNT)
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
                  isCorrect: j === 0,
                })),
            },
          }));

    // Create new quiz with questions and options
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        fileKey: data.fileKey,
        categoryId: data.categoryId,
        tenantId: tenantId, // Assign to current user's tenant
        isGlobal: data.isGlobal ?? false, // Allow admin to set global flag
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || defaultPassingScore,
        isActive: data.isActive ?? true,
        showQuestionReview: data.showQuestionReview ?? true,
        showCorrectAnswers: data.showCorrectAnswers ?? false,
        questions: {
          create: questionsPayload,
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
