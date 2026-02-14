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

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { categoryId, quizId, score, responses, hasPassed, isPerfectScore } = await validateRequestBody(req, quizFinishSchema);

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
    const quizWhereClause = buildTenantContentFilter(tenantId);

    // Get quiz to check passing score
    const quiz = await prisma.quiz.findFirst({
      where: { 
        id: quizId,
        ...quizWhereClause,
      },
      select: { passingScore: true, title: true },
    });

    if (!quiz) {
      throw new AppError("Quiz not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Determine if quiz was passed (use hasPassed from request or calculate)
    const passed = hasPassed !== undefined 
      ? hasPassed 
      : (quiz.passingScore ? score >= quiz.passingScore : true);

    // Fetch or create a categoryStat entry
    let stat = await prisma.categoryStat.findUnique({
      where: {
        userId_categoryId: {
          userId: user.id,
          categoryId,
        },
      },
    });

    if (stat) {
      // Calculate the average score
      const totalScore = (stat.averageScore || 0) * stat.completed + score;
      const newAverageScore = totalScore / (stat.completed + 1);

      // Update best score if current score is higher
      const newBestScore = stat.bestScore
        ? Math.max(stat.bestScore, score)
        : score;

      // Update the categoryStat entry
      stat = await prisma.categoryStat.update({
        where: { id: stat.id },
        data: {
          completed: stat.completed + 1,
          averageScore: newAverageScore,
          bestScore: newBestScore,
          lastAttempt: new Date(),
        },
      });
    } else {
      // Create a new categoryStat entry
      stat = await prisma.categoryStat.create({
        data: {
          userId: user.id,
          categoryId,
          attempts: 1,
          completed: 1,
          averageScore: score,
          bestScore: score,
          lastAttempt: new Date(),
        },
      });
    }

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
        const isPerfect = isPerfectScore !== undefined 
          ? isPerfectScore 
          : score === 100;
        
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
