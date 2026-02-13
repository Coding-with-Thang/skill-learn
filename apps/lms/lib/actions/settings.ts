"use server";

import prisma from "@skill-learn/lib/utils/connect";
import { requireAdminForAction } from "@skill-learn/lib/utils/auth";

const DEFAULT_SETTINGS = {
  // Points System
  DAILY_POINTS_LIMIT: "100000",
  POINTS_FOR_PASSING_QUIZ: "1000",
  PERFECT_SCORE_BONUS: "500",

  // Quiz Settings
  DEFAULT_QUIZ_TIME_LIMIT: "300", // 5 minutes in seconds
  DEFAULT_PASSING_SCORE: "70", // 70%
  SHUFFLE_QUESTIONS: "true",
  MAX_QUIZ_ATTEMPTS: "3",

  // Streak Settings
  STREAK_MILESTONE_INTERVAL: "5",
  STREAK_MILESTONE_BONUS: "5000",
  STREAK_RESET_HOUR: "0", // Midnight in user's timezone
  INACTIVITY_DAYS_FOR_STREAK_LOSS: "2",

  // Reward Settings
  MIN_POINTS_FOR_REWARDS: "1000",
  MAX_REWARD_VALUE: "50000",
  REWARD_EXPIRY_DAYS: "30",

  // User Settings
  MAX_DAILY_QUIZ_ATTEMPTS: "10",
  USERNAME_MIN_LENGTH: "3",
  USERNAME_MAX_LENGTH: "20",
};

export async function getSystemSetting(key) {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    return setting?.value || DEFAULT_SETTINGS[key];
  } catch (error) {
    console.error(`Error getting system setting ${key}:`, {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      cause: error.cause,
    });
    return DEFAULT_SETTINGS[key];
  }
}

/**
 * Update a system setting
 * @param {string} key - Setting key
 * @param {string|number} value - Setting value
 * @param {string|null} description - Optional description
 * @returns {Promise<object>} Updated setting
 */
export async function updateSystemSetting(key, value, description = null) {
  try {
    // Check admin authorization
    const { user } = await requireAdminForAction();

    // Validate setting exists
    if (!DEFAULT_SETTINGS.hasOwnProperty(key)) {
      throw new Error(`Invalid setting key: ${key}`);
    }

    // Update or create setting
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: String(value),
        description,
        updatedBy: user.id,
      },
      create: {
        key,
        value: String(value),
        description,
        updatedBy: user.id,
      },
    });

    return setting;
  } catch (error) {
    console.error(`Error updating system setting ${key}:`, error);
    throw error;
  }
}

/**
 * Get all system settings
 * @returns {Promise<object>} All system settings merged with defaults
 */
export async function getAllSystemSettings() {
  try {
    // Check admin authorization
    await requireAdminForAction();
    const settings = await prisma.systemSetting.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Merge with default settings for any missing values
    const allSettings = { ...DEFAULT_SETTINGS };
    settings.forEach((setting) => {
      allSettings[setting.key] = setting.value;
    });

    return allSettings;
  } catch (error) {
    console.error("Error getting all system settings:", error);
    throw error;
  }
}
