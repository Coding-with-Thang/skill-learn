import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { awardPoints } from "@/lib/actions/points";
import { getSystemSetting } from "@/lib/actions/settings";

export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { categoryId, quizId, score, responses, hasPassed, isPerfectScore } = await req.json();

    if (
      !categoryId ||
      !quizId ||
      typeof score !== "number" ||
      !Array.isArray(responses)
    ) {
      throw new AppError("Invalid request data", ErrorType.VALIDATION, {
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

    // Get quiz to check passing score
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
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
            console.warn("Could not award perfect score bonus:", bonusError.message);
          }
        }
      } catch (pointsError) {
        // If points can't be awarded (e.g., daily limit reached), log but don't fail the quiz completion
        console.warn("Could not award quiz points:", pointsError.message);
      }
    }

    return NextResponse.json({
      success: true,
      pointsAwarded,
      bonusAwarded,
      totalPointsAwarded: pointsAwarded + bonusAwarded,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
