/**
 * Greeting Generator Utility (next-intl version)
 */

import { useTranslations } from "next-intl";
import { useCallback } from "react";

// Priority levels
const PRIORITY = {
  FIRST_TIME: 100,
  STREAK_MILESTONE: 90,
  LEADERBOARD_TOP: 85,
  POINTS_MILESTONE: 80,
  STREAK_AT_RISK: 75,
  QUIZ_PERFECT: 70,
  SPECIAL_OCCASION: 65,
  RETURNING_USER: 60,
  STREAK_ACTIVE: 55,
  POINTS_ACHIEVEMENT: 50,
  LEADERBOARD_POSITION: 45,
  QUIZ_PERFORMANCE: 40,
  TIME_OF_DAY: 30,
  DEFAULT: 10,
};

type GreetingContext = {
  visitCount?: number;
  isFirstTime?: boolean;
  streak?: number;
  streakAtRisk?: boolean;
  leaderboardPosition?: number | null;
  points?: number;
  lastQuizScore?: number | null;
  lastActivityDate?: string | Date | null;
  firstName?: string;
};

type GreetingResult = {
  text: string;
  subtext: string;
  priority: number;
};

const FALLBACK_GREETING: GreetingResult = {
  text: "Welcome back!",
  subtext: "Let's continue learning.",
  priority: PRIORITY.DEFAULT,
};

function getRotatedIndex(visitCount: number, length: number) {
  return visitCount % length;
}

function getDaysSinceLastActivity(lastActivityDate?: string | Date | null) {
  if (!lastActivityDate) return 0;
  const now = new Date();
  const last = new Date(lastActivityDate);
  const diffTime = Math.abs(now.getTime() - last.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getSpecialOccasion() {
  const day = new Date().getDay();
  if (day === 0 || day === 6) return "weekend";
  if (day === 1) return "monday";
  return null;
}

function getTimeOfDayKey() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "lateNight";
}

/**
 * Custom hook that returns a locale-aware greeting generator.
 */
export function useGenerateGreeting() {
  const t = useTranslations("greetings");

  const getScenarioCount = useCallback(
    (key: string, fallbackCount: number) => {
      try {
        const scenario = t.raw(key);
        if (Array.isArray(scenario) && scenario.length > 0) {
          return scenario.length;
        }
      } catch {
        // Missing translations can happen in locales not yet fully translated.
      }
      return fallbackCount;
    },
    [t]
  );

  const getTranslation = useCallback(
    (
      key: string,
      index: number,
      field: "text" | "subtext",
      values: Record<string, string | number>
    ) => {
      try {
        return t(`${key}.${index}.${field}`, values);
      } catch {
        return field === "text"
          ? FALLBACK_GREETING.text
          : FALLBACK_GREETING.subtext;
      }
    },
    [t]
  );

  return useCallback((context: GreetingContext = {}): GreetingResult => {
    const visitCount = context.visitCount ?? 0;
    const scenarios: {
      priority: number;
      key: string;
      count: number;
    }[] = [];

    const pushScenario = (priority: number, key: string, count: number) => {
      scenarios.push({ priority, key, count });
    };

    // FIRST TIME
    if (context.isFirstTime) {
      pushScenario(
        PRIORITY.FIRST_TIME,
        "firstTime",
        getScenarioCount("firstTime", 9)
      );
    }

    const streak = context.streak ?? 0;

    if (streak >= 5 && [5, 10, 30, 50, 100, 200, 365].includes(streak)) {
      pushScenario(
        PRIORITY.STREAK_MILESTONE,
        "streakMilestone",
        getScenarioCount("streakMilestone", 5)
      );
    }

    if (context.streakAtRisk && streak > 0) {
      pushScenario(
        PRIORITY.STREAK_AT_RISK,
        "streakAtRisk",
        getScenarioCount("streakAtRisk", 5)
      );
    }

    if (streak > 0 && !context.streakAtRisk) {
      pushScenario(
        PRIORITY.STREAK_ACTIVE,
        "streakActive",
        getScenarioCount("streakActive", 5)
      );
    }

    if (context.leaderboardPosition && context.leaderboardPosition <= 3) {
      pushScenario(
        PRIORITY.LEADERBOARD_TOP,
        "leaderboardTop3",
        getScenarioCount("leaderboardTop3", 5)
      );
    }

    if (
      context.leaderboardPosition &&
      context.leaderboardPosition > 3 &&
      context.leaderboardPosition <= 10
    ) {
      pushScenario(
        PRIORITY.LEADERBOARD_POSITION,
        "leaderboardTop10",
        getScenarioCount("leaderboardTop10", 5)
      );
    }

    if (context.leaderboardPosition && context.leaderboardPosition > 10) {
      pushScenario(
        PRIORITY.LEADERBOARD_POSITION - 5,
        "leaderboardRising",
        getScenarioCount("leaderboardRising", 5)
      );
    }

    const points = Number(context.points ?? 0);

    if ([1000, 5000, 10000, 25000, 50000, 100000].includes(points)) {
      pushScenario(
        PRIORITY.POINTS_MILESTONE,
        "pointsMilestone",
        getScenarioCount("pointsMilestone", 5)
      );
    }

    if (points > 10000) {
      pushScenario(
        PRIORITY.POINTS_ACHIEVEMENT,
        "pointsHigh",
        getScenarioCount("pointsHigh", 5)
      );
    }

    if (points > 100) {
      pushScenario(
        PRIORITY.POINTS_ACHIEVEMENT - 10,
        "pointsGrowing",
        getScenarioCount("pointsGrowing", 5)
      );
    }

    if (context.lastQuizScore === 100) {
      pushScenario(
        PRIORITY.QUIZ_PERFECT,
        "quizPerfect",
        getScenarioCount("quizPerfect", 5)
      );
    }

    if (
      context.lastQuizScore &&
      context.lastQuizScore > 80 &&
      context.lastQuizScore < 100
    ) {
      pushScenario(
        PRIORITY.QUIZ_PERFORMANCE,
        "quizExcellent",
        getScenarioCount("quizExcellent", 5)
      );
    }

    const daysSince = getDaysSinceLastActivity(context.lastActivityDate);

    if (daysSince > 7) {
      pushScenario(
        PRIORITY.RETURNING_USER,
        "longAbsence",
        getScenarioCount("longAbsence", 5)
      );
    }

    if (daysSince >= 1 && daysSince <= 7) {
      pushScenario(
        PRIORITY.RETURNING_USER - 10,
        "returningUser",
        getScenarioCount("returningUser", 5)
      );
    }

    const timeOfDay = getTimeOfDayKey();
    pushScenario(
      PRIORITY.TIME_OF_DAY,
      timeOfDay,
      getScenarioCount(timeOfDay, 1)
    );

    if (timeOfDay === "lateNight") {
      // Keep "late night learner" messages slightly higher than regular time-of-day.
      pushScenario(
        PRIORITY.TIME_OF_DAY + 2,
        "lateNight",
        getScenarioCount("lateNight", 1)
      );
    }

    const occasion = getSpecialOccasion();
    if (occasion) {
      pushScenario(
        PRIORITY.SPECIAL_OCCASION,
        occasion,
        getScenarioCount(occasion, 5)
      );
    }

    // Default fallback
    pushScenario(PRIORITY.DEFAULT, "default", getScenarioCount("default", 5));

    scenarios.sort((a, b) => b.priority - a.priority);
    const selected = scenarios[0] ?? {
      priority: PRIORITY.DEFAULT,
      key: "default",
      count: 1,
    };

    const index = getRotatedIndex(visitCount, Math.max(selected.count, 1));
    const values = {
      name: context.firstName || "there",
      streak,
      points,
      position: context.leaderboardPosition ?? "?",
      score: context.lastQuizScore ?? 0,
    };

    return {
      text: getTranslation(selected.key, index, "text", values),
      subtext: getTranslation(selected.key, index, "subtext", values),
      priority: selected.priority,
    };
  }, [getScenarioCount, getTranslation]);
}

export default useGenerateGreeting;
