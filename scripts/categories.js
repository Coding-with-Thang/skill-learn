require("dotenv").config({ path: "env.local" });

let categoriesPrisma;

async function addCategories() {
  const { PrismaClient } = require("@prisma/client");

  categoriesPrisma = new PrismaClient();

  const categories = [
    {
      name: "Soft Skills",
      description:
        "Soft skills training focuses on the development of abilities such as communication, emotional intelligence, positive attitude, and problem solving.",
      imageUrl:
        "https://www.protouchpro.com/wp-content/uploads/2023/10/Soft-Skill.jpg",
    }
  ];

  console.log("Adding Categories...");

  for (const category of categories) {
    await categoriesPrisma.category.create({
      data: category,
    });
  }

  console.log("Categories Added Successfully!");
}

addCategories()
  .catch((e) => {
    console.log("Error Adding Categories: ", e);
  })
  .finally(async () => {
    await categoriesPrisma.$disconnect();
  });
