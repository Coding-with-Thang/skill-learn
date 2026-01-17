const path = require("path");
const fs = require("fs");

// Try to load .env.local first, then .env as fallback
const rootDir = path.resolve(__dirname, "../../../../");
const envLocalPath = path.join(rootDir, ".env.local");
const envPath = path.join(rootDir, ".env");

if (fs.existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  // Try default dotenv behavior (looks in current and parent directories)
  require("dotenv").config();
}

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Find the twcc-corp tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: "twcc-corp" },
    });

    if (!tenant) {
      throw new Error('Tenant with slug "twcc-corp" not found');
    }

    console.log(`Found tenant: ${tenant.name} (${tenant.slug}) - ID: ${tenant.id}\n`);

    // Count existing resources before assignment
    const totalCategories = await prisma.category.count();
    const totalQuizzes = await prisma.quiz.count();
    const totalCourses = await prisma.course.count();
    const totalRewards = await prisma.reward.count();

    console.log(`Found ${totalCategories} categories, ${totalQuizzes} quizzes, ${totalCourses} courses, ${totalRewards} rewards\n`);

    // Assign ALL Categories to twcc-corp (regardless of current tenantId)
    const categoriesResult = await prisma.category.updateMany({
      where: {}, // No filter - update all categories
      data: {
        tenantId: tenant.id,
      },
    });
    console.log(`✓ Assigned ${categoriesResult.count} categories to ${tenant.slug}`);

    // Assign ALL Quizzes to twcc-corp (regardless of current tenantId)
    const quizzesResult = await prisma.quiz.updateMany({
      where: {}, // No filter - update all quizzes
      data: {
        tenantId: tenant.id,
      },
    });
    console.log(`✓ Assigned ${quizzesResult.count} quizzes to ${tenant.slug}`);

    // Assign ALL Courses to twcc-corp (regardless of current tenantId)
    const coursesResult = await prisma.course.updateMany({
      where: {}, // No filter - update all courses
      data: {
        tenantId: tenant.id,
      },
    });
    console.log(`✓ Assigned ${coursesResult.count} courses to ${tenant.slug}`);

    // Assign ALL Rewards to twcc-corp (regardless of current tenantId)
    const rewardsResult = await prisma.reward.updateMany({
      where: {}, // No filter - update all rewards
      data: {
        tenantId: tenant.id,
      },
    });
    console.log(`✓ Assigned ${rewardsResult.count} rewards to ${tenant.slug}`);

    // Games are kept global (not assigned to tenant)
    const gamesCount = await prisma.game.count({
      where: {
        tenantId: null,
      },
    });
    console.log(`✓ Games remain global (${gamesCount} games with null tenantId)`);

    // Summary
    console.log("\n=== Migration Summary ===");
    console.log(`Categories assigned: ${categoriesResult.count}`);
    console.log(`Quizzes assigned: ${quizzesResult.count}`);
    console.log(`Courses assigned: ${coursesResult.count}`);
    console.log(`Rewards assigned: ${rewardsResult.count}`);
    console.log(`Games kept global: ${gamesCount}`);
    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("Error assigning resources to tenant:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
