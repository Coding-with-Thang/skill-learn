import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getSystemSetting } from "@/lib/actions/settings";

export async function GET() {
  try {
    // Get settings from database
    const defaultPassingScore = parseInt(await getSystemSetting("DEFAULT_PASSING_SCORE"), 10);
    const dailyPointsLimit = parseInt(await getSystemSetting("DAILY_POINTS_LIMIT"), 10);
    const pointsForPassingQuiz = parseInt(await getSystemSetting("POINTS_FOR_PASSING_QUIZ"), 10);
    const defaultTimeLimit = parseInt(await getSystemSetting("DEFAULT_QUIZ_TIME_LIMIT"), 10);

    const quizSettings = {
      dailyPointsLimit, // Maximum points a user can earn per day
      pointsPerQuestion: pointsForPassingQuiz, // Base points for each correct answer
      bonusMultiplier: 2, // Multiplier for perfect scores
      passingScoreDefault: defaultPassingScore, // Default passing score percentage
      timeLimit: Math.floor(defaultTimeLimit / 60), // Default time limit in minutes (convert from seconds)
    };

    return successResponse({ quizSettings });
  } catch (error) {
    return handleApiError(error);
  }
}
