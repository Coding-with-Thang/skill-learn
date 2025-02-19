require("dotenv").config({ path: "env.local" });

let quizzesPrisma;

async function seedQuizzes() {
  const { PrismaClient } = require("@prisma/client");

  quizzesPrisma = new PrismaClient();

  const quizzes = [
    {
      title: "Quiz 1",
      description: "First quiz",
      categoryId: "67b401fc1d7876c47bdb0379", //Replace with your actual Category ID
    },
    {
      title: "Quiz 2",
      description: "Second quiz",
      categoryId: "67b401fc1d7876c47bdb0379",
    },
    {
      title: "Quiz 3",
      description: "Third quiz",
      categoryId: "67b401fc1d7876c47bdb0379",
    },
  ];

  console.log("Adding Quizzes...");

  for (const quiz of quizzes) {
    const createdQuiz = await quizzesPrisma.quiz.create({
      data: quiz,
    });
    console.log("Created quizzes: ", `${createdQuiz.title}`);
  }

  console.log("Seeding quizzes completed");
}

seedQuizzes()
  .catch((e) => {
    console.log("Error Adding Quizzes: ", e);
  })
  .finally(async () => {
    await quizzesPrisma.$disconnect();
  });
