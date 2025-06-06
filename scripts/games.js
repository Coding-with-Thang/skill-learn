require("dotenv").config({ path: "env.local" });

let gamesPrisma;

async function seedQuizzes() {
  const { PrismaClient } = require("@prisma/client");

  gamesPrisma = new PrismaClient();

  const games = [
    {
      title: "Tic Tac Toe",
      description:
        "A game in which two players seek in alternate turns to complete a row, a column, or a diagonal with either three O's or three X's drawn in the spaces of a grid of nine squares.",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/tic-tac-toe.png?alt=media&token=2071a1a8-5332-4b5a-9d77-027dcb57da28.png",
      genre: "Brain Teaser",
      slug: "tic-tac-toe",
    },
    {
      title: "Emoji Memory",
      description:
        "A card matching game involves player finding pairs of matching icons from a grid of cards that are initially face down, using their memory to remember card locations and patterns.",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/memory-game.jpg?alt=media&token=a13efab0-7194-431b-a64f-c89008f72d6e.jpg",
      genre: "Brain Teaser",
      slug: "emoji-memory",
    },
    {
      title: "The Guessing Game",
      description:
        "In The Guessing Game, a player attempts to guess a randomly generated secret number from 1-100, receiving feedback (like 'too high' or 'too low') after each guess until the number is guessed or the attempts run out.",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/skill-learn-6b01f.firebasestorage.app/o/guessing-game.jpg?alt=media&token=dab73276-069e-4e0a-99ad-4135846f8f7f.jpg",
      genre: "Brain Teaser",
      slug: "guessing-game",
    },
  ];

  console.log("Adding Games...");

  for (const game of games) {
    const createdGame = await gamesPrisma.game.create({
      data: game,
    });
    console.log("Created game:", `${createdGame.title}`);
  }

  console.log("Seeding games completed");
}

seedQuizzes()
  .catch((e) => {
    console.log("Error Adding Games: ", e);
  })
  .finally(async () => {
    await gamesPrisma.$disconnect();
  });
