import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { objectIdSchema } from "@skill-learn/lib/zodSchemas";
import { z } from "zod";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = adminResult;
    const { userId } = await z.object({ userId: objectIdSchema }).parseAsync(await params);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tenantId: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    if (tenantId && user.tenantId !== tenantId) {
      throw new AppError("User not in your tenant", ErrorType.VALIDATION, { status: 403 });
    }

    const [quizProgress, courseProgress, pointLogs] = await Promise.all([
      prisma.quizProgress.findMany({
        where: { userId },
        select: {
          quizId: true,
          quiz: { select: { id: true, title: true } },
          attempts: true,
          passedAttempts: true,
          bestScore: true,
        },
      }),
      prisma.courseProgress.findMany({
        where: { userId },
        select: {
          courseId: true,
          course: { select: { id: true, title: true } },
          completedAt: true,
        },
      }),
      prisma.pointLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          amount: true,
          reason: true,
          createdAt: true,
        },
      }),
    ]);

    const quizzes = quizProgress.map((q) => ({
      id: q.quiz.id,
      title: q.quiz.title,
      attempts: q.attempts,
      passedAttempts: q.passedAttempts,
      bestScore: q.bestScore,
    }));
    const courses = courseProgress.map((c) => ({
      id: c.course.id,
      title: c.course.title,
      completedAt: c.completedAt,
    }));
    const pointLogList = pointLogs.map((p) => ({
      id: p.id,
      amount: p.amount,
      reason: p.reason,
      createdAt: p.createdAt,
    }));

    return successResponse({
      quizzes,
      courses,
      pointLogs: pointLogList,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
