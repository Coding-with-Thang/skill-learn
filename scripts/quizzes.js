require("dotenv").config({ path: "env.local" });

let quizzesPrisma;

async function seedQuizzes() {
  const { PrismaClient } = require("@prisma/client");

  quizzesPrisma = new PrismaClient();

  const quizzes = [
    {
      title: "Dental Quiz",
      description: "5 fun dental questions to test your knowledge",
      categoryId: "67b401fc1d7876c47bdb037a", //Replace with your actual Category ID
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
