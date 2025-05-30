require("dotenv").config({ path: "env.local" });

const rules = require("./games/rules/");

let rulesPrisma;

async function seedRules() {
  const { PrismaClient } = require("@prisma/client");

  rulesPrisma = new PrismaClient();

  console.log("Seeding questions...");

  for (const rule of rules) {
    const createdRule = await rulesPrisma.rule.create({
      data: rule,
    });

    console.log(`Created rule: ${createdRule.text}`);
  }
  console.log("Seeding rules completed.");
}

seedRules()
  .catch((e) => {
    console.log("Error seeding rules: ", e);
  })
  .finally(async () => {
    await rulesPrisma.$disconnect();
  });
