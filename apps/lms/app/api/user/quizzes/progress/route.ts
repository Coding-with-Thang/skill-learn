import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

function parseObjectIdList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^[a-f0-9]{24}$/i.test(value));
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const requestedQuizIds = parseObjectIdList(
      request.nextUrl.searchParams.get("quizIds")
    );

    let scopedQuizIds = requestedQuizIds;
    if (requestedQuizIds.length > 0) {
      const tenantId = await getTenantId();
      const whereClause = buildTenantContentFilter(tenantId, {
        isActive: true,
      });

      const accessibleQuizzes = await prisma.quiz.findMany({
        where: {
          id: { in: requestedQuizIds },
          ...whereClause,
        },
        select: { id: true },
      });
      scopedQuizIds = accessibleQuizzes.map((quiz) => quiz.id);
    }

    const progressRows = await prisma.quizProgress.findMany({
      where: {
        userId: user.id,
        ...(scopedQuizIds.length > 0
          ? {
              quizId: { in: scopedQuizIds },
            }
          : {}),
      },
      select: {
        quizId: true,
        attempts: true,
        completedAttempts: true,
        passedAttempts: true,
        averageScore: true,
        bestScore: true,
        lastAttemptAt: true,
        lastPassedAt: true,
      },
    });

    const progressByQuizId: Record<string, unknown> = {};
    for (const row of progressRows) {
      progressByQuizId[row.quizId] = {
        attempts: row.attempts,
        completedAttempts: row.completedAttempts,
        passedAttempts: row.passedAttempts,
        averageScore: row.averageScore,
        bestScore: row.bestScore,
        lastAttemptAt: row.lastAttemptAt,
        lastPassedAt: row.lastPassedAt,
        status:
          row.passedAttempts > 0
            ? "completed"
            : row.attempts > 0
              ? "in-progress"
              : "not-started",
      };
    }

    // Include default entries for requested IDs without progress yet.
    for (const quizId of scopedQuizIds) {
      if (!progressByQuizId[quizId]) {
        progressByQuizId[quizId] = {
          attempts: 0,
          completedAttempts: 0,
          passedAttempts: 0,
          averageScore: null,
          bestScore: null,
          lastAttemptAt: null,
          lastPassedAt: null,
          status: "not-started",
        };
      }
    }

    return successResponse({
      progressByQuizId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
