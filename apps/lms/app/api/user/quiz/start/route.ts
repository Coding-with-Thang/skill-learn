import { prisma } from '@skill-learn/database';
import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { logAuditEvent } from "@skill-learn/lib/utils/auditLogger";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { quizId } = await req.json();
    if (!quizId) {
      throw new AppError("Quiz ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const tenantId = await getTenantId();
    const whereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        ...whereClause,
      },
      select: {
        id: true,
        title: true,
        categoryId: true,
        tenantId: true,
        questions: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!quiz) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    if (quiz.questions.length === 0) {
      throw new AppError("Quiz has no questions", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const now = new Date();

    const { attempt, abandonedCount } = await prisma.$transaction(async (tx) => {
      // Keep only one active attempt per user/quiz.
      const abandoned = await tx.quizAttempt.updateMany({
        where: {
          userId: user.id,
          quizId: quiz.id,
          status: "IN_PROGRESS",
        },
        data: {
          status: "ABANDONED",
          finishedAt: now,
        },
      });

      const created = await tx.quizAttempt.create({
        data: {
          userId: user.id,
          quizId: quiz.id,
          categoryId: quiz.categoryId,
          tenantId: quiz.tenantId ?? null,
          startedAt: now,
          status: "IN_PROGRESS",
        },
      });

      await tx.quizProgress.upsert({
        where: {
          userId_quizId: {
            userId: user.id,
            quizId: quiz.id,
          },
        },
        create: {
          userId: user.id,
          quizId: quiz.id,
          categoryId: quiz.categoryId,
          tenantId: quiz.tenantId ?? null,
          attempts: 1,
          lastAttemptAt: now,
        },
        update: {
          attempts: { increment: 1 },
          categoryId: quiz.categoryId,
          tenantId: quiz.tenantId ?? null,
          lastAttemptAt: now,
        },
      });

      return {
        attempt: created,
        abandonedCount: abandoned.count,
      };
    });

    await logAuditEvent(
      user.id,
      "create",
      "quiz_attempt",
      attempt.id,
      `Started attempt for quiz "${quiz.title}" (${quiz.id})${abandonedCount > 0 ? ` and auto-abandoned ${abandonedCount} previous in-progress attempt(s)` : ""}`
    );

    return successResponse({
      attemptId: attempt.id,
      startedAt: attempt.startedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
