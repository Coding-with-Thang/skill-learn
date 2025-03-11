require("dotenv").config({ path: "env.local" });

const questions = require("./quizzes/quizOneQuestions");

let questionsPrisma;

async function seedQuestions() {
  const { PrismaClient } = require("@prisma/client");

  questionsPrisma = new PrismaClient();

  console.log("Seeding questions...");

  for (const question of questions) {
    const createdQuestion = await questionsPrisma.question.create({
      data: {
        text: question.text,
        quizId: "67b5502c32660b4f108e01c1", //EwplXW
        options: {
          create: question.options,
        },
      },
    });

    console.log(`Created question: ${createdQuestion.text}`);
  }
  console.log("Seeding questions completed.");
}

seedQuestions()
  .catch((e) => {
    console.log("Error seeding questions: ", e);
  })
  .finally(async () => {
    await questionsPrisma.$disconnect();
  });
