import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { awardPoints, getDailyPointStatus } from "@/lib/points";
import { getSystemSetting } from "@/lib/actions/settings";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { quizFinishSchema } from "@/lib/zodSchemas";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

type QuizResponseInput = {
  questionId: string;
  selectedOptionIds: string[];
};

function isCorrectResponse(selectedOptionIds: string[], correctOptionIds: string[]): boolean {
  if (selectedOptionIds.length !== correctOptionIds.length) return false;
  const selectedSet = new Set(selectedOptionIds);
  return correctOptionIds.every((id) => selectedSet.has(id));
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { quizId, attemptId, responses, timeSpent } = await validateRequestBody(req, quizFinishSchema);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter quiz by tenant or global content
    const quizWhereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const quizWithQuestions = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        ...quizWhereClause,
      },
      select: {
        id: true,
        passingScore: true,
        categoryId: true,
        tenantId: true,
        questions: {
          select: {
            id: true,
            text: true,
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

    if (!quizWithQuestions) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    if (quizWithQuestions.questions.length === 0) {
      throw new AppError("Quiz has no questions", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const responsesByQuestionId = new Map<string, QuizResponseInput>();
    for (const response of responses as QuizResponseInput[]) {
      responsesByQuestionId.set(response.questionId, response);
    }

    const detailedResponses = quizWithQuestions.questions.map((question) => {
      const submitted = responsesByQuestionId.get(question.id);
      const allowedOptionIds = new Set(question.options.map((option) => option.id));
      const selectedOptionIds = (submitted?.selectedOptionIds ?? []).filter((id) =>
        allowedOptionIds.has(id)
      );
      const correctOptions = question.options.filter((option) => option.isCorrect);
      const correctOptionIds = correctOptions.map((option) => option.id);
      const correct = isCorrectResponse(selectedOptionIds, correctOptionIds);
      const selectedAnswer = question.options
        .filter((option) => selectedOptionIds.includes(option.id))
        .map((option) => option.text)
        .join(", ");
      const correctAnswer = correctOptions.map((option) => option.text).join(", ");

      return {
        questionId: question.id,
        selectedOptionIds,
        isCorrect: correct,
        question: question.text,
        selectedAnswer,
        correctAnswer,
      };
    });

    const totalQuestions = quizWithQuestions.questions.length;
    const correctAnswers = detailedResponses.reduce(
      (sum, response) => sum + (response.isCorrect ? 1 : 0),
      0
    );
    const rawScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const score = Number(rawScore.toFixed(1));
    const passed = quizWithQuestions.passingScore
      ? score >= quizWithQuestions.passingScore
      : true;
    const isPerfectScore = totalQuestions > 0 && correctAnswers === totalQuestions;
    const now = new Date();

    const quizProgress = await prisma.$transaction(async (tx) => {
      const existingAttempt = attemptId
        ? await tx.quizAttempt.findFirst({
            where: {
              id: attemptId,
              userId: user.id,
              quizId,
            },
          })
        : await tx.quizAttempt.findFirst({
            where: {
              userId: user.id,
              quizId,
              status: "IN_PROGRESS",
            },
            orderBy: {
              startedAt: "desc",
            },
          });

      const startedAt =
        existingAttempt?.startedAt ??
        (typeof timeSpent === "number" && timeSpent > 0
          ? new Date(now.getTime() - timeSpent * 1000)
          : now);

      if (existingAttempt && existingAttempt.status !== "IN_PROGRESS") {
        throw new AppError("Quiz attempt already submitted", ErrorType.VALIDATION, {
          status: 409,
        });
      }

      if (existingAttempt) {
        await tx.quizAttempt.update({
          where: { id: existingAttempt.id },
          data: {
            status: "COMPLETED",
            finishedAt: now,
            score,
            passed,
            totalQuestions,
            correctAnswers,
            timeSpent: timeSpent ?? null,
            responses: detailedResponses,
          },
        });
      } else {
        await tx.quizAttempt.create({
          data: {
            userId: user.id,
            quizId: quizWithQuestions.id,
            categoryId: quizWithQuestions.categoryId,
            tenantId: quizWithQuestions.tenantId ?? null,
            status: "COMPLETED",
            startedAt,
            finishedAt: now,
            score,
            passed,
            totalQuestions,
            correctAnswers,
            timeSpent: timeSpent ?? null,
            responses: detailedResponses,
          },
        });
      }

      const existingProgress = await tx.quizProgress.findUnique({
        where: {
          userId_quizId: {
            userId: user.id,
            quizId: quizWithQuestions.id,
          },
        },
      });

      const addImplicitAttempt = !existingAttempt;
      const previousCompleted = existingProgress?.completedAttempts ?? 0;
      const nextCompleted = previousCompleted + 1;
      const totalScore = (existingProgress?.averageScore ?? 0) * previousCompleted + score;
      const nextAverage = totalScore / nextCompleted;
      const nextBest =
        existingProgress?.bestScore != null
          ? Math.max(existingProgress.bestScore, score)
          : score;

      if (!existingProgress) {
        return tx.quizProgress.create({
          data: {
            userId: user.id,
            quizId: quizWithQuestions.id,
            categoryId: quizWithQuestions.categoryId,
            tenantId: quizWithQuestions.tenantId ?? null,
            attempts: 1,
            completedAttempts: 1,
            passedAttempts: passed ? 1 : 0,
            averageScore: score,
            bestScore: score,
            lastAttemptAt: now,
            lastPassedAt: passed ? now : null,
          },
        });
      }

      const updated = await tx.quizProgress.update({
        where: {
          userId_quizId: {
            userId: user.id,
            quizId: quizWithQuestions.id,
          },
        },
        data: {
          categoryId: quizWithQuestions.categoryId,
          tenantId: quizWithQuestions.tenantId ?? null,
          attempts: addImplicitAttempt ? { increment: 1 } : undefined,
          completedAttempts: { increment: 1 },
          passedAttempts: passed ? { increment: 1 } : undefined,
          averageScore: nextAverage,
          bestScore: nextBest,
          lastAttemptAt: now,
          lastPassedAt: passed ? now : existingProgress.lastPassedAt,
        },
      });

      // Keep counters consistent even if data drifted before this migration.
      if (updated.attempts < updated.completedAttempts) {
        return tx.quizProgress.update({
          where: { id: updated.id },
          data: {
            attempts: updated.completedAttempts,
          },
        });
      }

      return updated;
    });

    await prisma.quiz.update({
      where: { id: quizWithQuestions.id },
      data: {
        lastAttempt: now,
      },
    });

    // Award points if quiz was passed
    let pointsAwarded = 0;
    let bonusAwarded = 0;
    
    if (passed) {
      try {
        // Get points settings
        const basePoints = parseInt(
          await getSystemSetting("POINTS_FOR_PASSING_QUIZ"),
          10
        );
        const perfectScoreBonus = parseInt(
          await getSystemSetting("PERFECT_SCORE_BONUS"),
          10
        );

        // Award base points for passing
        const baseResult = await awardPoints(
          basePoints,
          `quiz_completed_${quizId}`,
          req
        );
        pointsAwarded = baseResult.awarded;

        // Award bonus for perfect score
        const isPerfect = isPerfectScore;
        
        if (isPerfect && perfectScoreBonus > 0) {
          try {
            const bonusResult = await awardPoints(
              perfectScoreBonus,
              `perfect_score_bonus_${quizId}`,
              req
            );
            bonusAwarded = bonusResult.awarded;
          } catch (bonusError) {
            // If bonus can't be awarded (e.g., daily limit reached), log but don't fail
            console.warn("Could not award perfect score bonus:", bonusError instanceof Error ? bonusError.message : String(bonusError));
          }
        }
      } catch (pointsError) {
        // If points can't be awarded (e.g., daily limit reached), log but don't fail the quiz completion
        console.warn("Could not award quiz points:", pointsError instanceof Error ? pointsError.message : String(pointsError));
      }
    }

    // Fetch updated daily status to include in response (eliminates need for follow-up call)
    let updatedDailyStatus: Awaited<ReturnType<typeof getDailyPointStatus>> | null = null;
    try {
      updatedDailyStatus = await getDailyPointStatus(req);
    } catch (statusError) {
      // If we can't get updated status, continue without it (non-critical)
      console.warn("Could not fetch updated daily status:", statusError instanceof Error ? statusError.message : String(statusError));
    }

    return successResponse({
      score,
      totalQuestions,
      correctAnswers,
      hasPassed: passed,
      isPerfectScore,
      passingScore: quizWithQuestions.passingScore || 0,
      detailedResponses,
      quizProgress: {
        attempts: quizProgress.attempts,
        completedAttempts: quizProgress.completedAttempts,
        passedAttempts: quizProgress.passedAttempts,
        averageScore: quizProgress.averageScore,
        bestScore: quizProgress.bestScore,
        lastAttemptAt: quizProgress.lastAttemptAt,
        lastPassedAt: quizProgress.lastPassedAt,
        status:
          quizProgress.passedAttempts > 0
            ? "completed"
            : quizProgress.attempts > 0
              ? "in-progress"
              : "not-started",
      },
      pointsAwarded,
      bonusAwarded,
      totalPointsAwarded: pointsAwarded + bonusAwarded,
      dailyStatus: updatedDailyStatus ? {
        todaysPoints: updatedDailyStatus.todaysPoints || 0,
        canEarnPoints: updatedDailyStatus.canEarnPoints !== false,
        dailyLimit: updatedDailyStatus.dailyLimit || 0,
        remainingDailyPoints: Math.max(0, 
          (updatedDailyStatus.dailyLimit || 0) - (updatedDailyStatus.todaysPoints || 0)
        ),
      } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
