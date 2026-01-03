import { notFound } from 'next/navigation';
import GuessingGame from "@/components/features/games/GuessingGame";
import MemoryGame from "@/components/features/games/MemoryGame";
import RockPaperScissors from "@/components/features/games/RockPaperScissors";
import TicTacToe from "@/components/features/games/TicTacToe";

// Game registry: maps URL-friendly game names to their components
const GAME_REGISTRY = {
  'guessing-game': {
    component: GuessingGame,
    title: 'The Guessing Game',
  },
  'memory-game': {
    component: MemoryGame,
    title: 'Emoji Memory',
  },
  'rock-paper-scissors': {
    component: RockPaperScissors,
    title: 'Rock Paper Scissors',
  },
  'tic-tac-toe': {
    component: TicTacToe,
    title: 'Tic Tac Toe',
  },
};

export default async function GamePage({ params }) {
  // Get game name from URL params (Next.js 15 requires awaiting params)
  const { gameName } = await params;

  // Check if game exists in registry
  if (!gameName || !GAME_REGISTRY[gameName]) {
    notFound();
  }

  const { component: GameComponent } = GAME_REGISTRY[gameName];

  // Render the game component (it's a client component, so this server component can import it)
  return <GameComponent />;
}

// Generate static params for all games (optional, for better performance)
export async function generateStaticParams() {
  return Object.keys(GAME_REGISTRY).map((gameName) => ({
    gameName,
  }));
}

