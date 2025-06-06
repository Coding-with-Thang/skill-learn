const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // First, let's check existing rewards
    const existingRewards = await prisma.reward.findMany();
    console.log(`Found ${existingRewards.length} existing rewards`);

    // Update all existing rewards to have default values
    const updateResult = await prisma.reward.updateMany({
      data: {
        allowMultiple: false,
        maxRedemptions: 1,
      },
    });

    console.log(
      `Updated ${updateResult.count} rewards with default redemption limits`
    );

    // Verify the updates
    const verifyRewards = await prisma.reward.findMany({
      select: {
        prize: true,
        allowMultiple: true,
        maxRedemptions: true,
      },
    });

    console.log("Current rewards state:");
    verifyRewards.forEach((reward) => {
      console.log(
        `- ${reward.prize}: allowMultiple=${reward.allowMultiple}, maxRedemptions=${reward.maxRedemptions}`
      );
    });
  } catch (error) {
    console.error("Error updating rewards:", error);
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
