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
      image:
        "https://www.protouchpro.com/wp-content/uploads/2023/10/Soft-Skill.jpg",
    },
    {
      name: "Product Knowledge",
      description:
        "Product knowledge training equips agents with information specific to the CDN. This can include features, benefits, uses and procedure structure. Product knowledge encompasses a solid understanding of external factors - like how the product fits the customers.",
      image:
        "https://cdn.shopify.com/s/files/1/1246/6441/articles/Product_Knowledge.png?v=1727354905&originalWidth=1848&originalHeight=782&width=1800.jpg",
    },
    {
      name: "Internal Systems and Tools",
      description:
        "Review and learn how to become more familiar with internal systems and tools.",
      image:
        "https://www.boc-group.com/wp-content/uploads/2022/11/IKS-Software-individuelles-Dashboard-scaled.jpg",
    },
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
