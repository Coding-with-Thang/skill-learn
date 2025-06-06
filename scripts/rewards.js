require("dotenv").config({ path: "env.local" });

let rewardPrisma;

async function seedRewards() {
  const { PrismaClient } = require("@prisma/client");

  rewardPrisma = new PrismaClient();

  const rewards = [
    {
      prize: "5-minute Play Session",
      description:
        "Play the games available under Games for 5 minutes  (*manager approved required)",
      cost: 50,
      imageUrl: "../../../public/play.jpg",
      featured: false,
      allowMultiple: true,
      maxRedemptions: null,
    },
    {
      prize: "15-minute Break",
      description:
        "Redeem an additional 15-minute break (*manager approved required)",
      cost: 150,
      imageUrl: "../../../public/15break.jpg",
      featured: false,
      allowMultiple: true,
      maxRedemptions: 1,
    },
    {
      prize: "Free Lunch",
      description: "Redeem a free lunch from SkipTheWalkIn (value $10)",
      cost: 500,
      imageUrl: "../../../public/lunch.jpg",
      featured: false,
      allowMultiple: false,
      maxRedemptions: 1,
    },
    {
      prize: "Flying Pie",
      description: "Select a manager and throw a pie at their face!",
      cost: 10000,
      imageUrl: "../../../public/flying-pie.jpg",
      featured: false,
      allowMultiple: false,
      maxRedemptions: 1,
    },
    {
      prize: "Chicken Dance",
      description: "Sara does the chicken dance x3!",
      cost: 50000,
      imageUrl: "../../../public/chicken-dance.jpg",
      featured: true,
      allowMultiple: false,
      maxRedemptions: 1,
    },
  ];

  console.log("Adding Rewards...");

  for (const reward of rewards) {
    const createdReward = await rewardPrisma.reward.create({
      data: reward,
    });
    console.log("Created rewards: ", `${createdReward.title}`);
  }

  console.log("Seeding rewards completed");
}

seedRewards()
  .catch((e) => {
    console.log("Error seeding rewards: ", e);
  })
  .finally(async () => {
    await rewardPrisma.$disconnect();
  });
