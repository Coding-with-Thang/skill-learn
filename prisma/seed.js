import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Default system settings for tenants
 * These are seeded per tenant when they are created
 */
const defaultSystemSettings = [
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

/**
 * Seed system settings for a specific tenant
 * @param {string} tenantId - The tenant ID to seed settings for
 */
async function seedTenantSettings(tenantId) {
  console.log(`  Seeding settings for tenant: ${tenantId}`);
  
  for (const setting of defaultSystemSettings) {
    await prisma.systemSetting.upsert({
      where: {
        tenantId_key: {
          tenantId: tenantId,
          key: setting.key,
        },
      },
      update: {
        value: setting.value,
        description: setting.description,
        category: setting.category,
      },
      create: {
        tenantId: tenantId,
        key: setting.key,
        value: setting.value,
        description: setting.description,
        category: setting.category,
      },
    });
  }
  
  console.log(`  ✓ Seeded ${defaultSystemSettings.length} settings for tenant`);
}

async function main() {
  try {
    console.log("🚀 Starting database seed...\n");

    // Get all existing tenants
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
    });

    if (tenants.length === 0) {
      console.log("⚠️  No tenants found. Creating a default tenant...");
      
      // Create a default tenant
      const defaultTenant = await prisma.tenant.create({
        data: {
          name: "Default Organization",
          slug: "default",
          subscriptionTier: "professional",
          maxRoleSlots: 5,
          baseRoleSlots: 5,
        },
      });
      
      console.log(`✓ Created default tenant: ${defaultTenant.name} (${defaultTenant.slug})`);
      tenants.push(defaultTenant);
    }

    // Seed system settings for each tenant
    console.log("\n📋 Seeding system settings...");
    for (const tenant of tenants) {
      await seedTenantSettings(tenant.id);
    }

    console.log("\n✅ Seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Export for use in other scripts
export { defaultSystemSettings, seedTenantSettings };
