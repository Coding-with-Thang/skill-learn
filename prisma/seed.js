import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const systemSettings = [
  {
    key: "DAILY_POINTS_LIMIT",
    value: "100000",
    description: "Maximum points a user can earn per day",
    category: "points",
  },
  {
    key: "POINTS_FOR_PASSING_QUIZ",
    value: "1000",
    description: "Base points awarded for passing a quiz",
    category: "points",
  },
  {
    key: "PERFECT_SCORE_BONUS",
    value: "500",
    description: "Additional points awarded for achieving a perfect score",
    category: "points",
  },
  {
    key: "DEFAULT_QUIZ_TIME_LIMIT",
    value: "300",
    description: "Time limit in seconds for quizzes",
    category: "quiz",
  },
  {
    key: "DEFAULT_PASSING_SCORE",
    value: "70",
    description: "Minimum percentage required to pass a quiz",
    category: "quiz",
  },
  {
    key: "STREAK_MILESTONE_INTERVAL",
    value: "5",
    description: "Number of days for streak milestone bonus",
    category: "streak",
  },
  {
    key: "STREAK_MILESTONE_BONUS",
    value: "5000",
    description: "Points awarded for reaching streak milestone",
    category: "streak",
  },
  {
    key: "STREAK_RESET_HOUR",
    value: "0",
    description: "Hour of day (0-23) when streaks reset",
    category: "streak",
  },
  {
    key: "INACTIVITY_DAYS_FOR_STREAK_LOSS",
    value: "2",
    description: "Days of inactivity before streak resets",
    category: "streak",
  },
];

async function main() {
  try {
    // Seed system settings
    for (const setting of systemSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          description: setting.description,
          category: setting.category,
        },
        create: {
          key: setting.key,
          value: setting.value,
          description: setting.description,
          category: setting.category,
        },
      });
      console.log(`Setting created/updated: ${setting.key}`);
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
