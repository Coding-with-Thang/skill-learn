import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@skill-learn/ui/components/button';
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import GuessingGame from "@/components/games/GuessingGame";
import MemoryGame from "@/components/games/MemoryGame";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import TicTacToe from "@/components/games/TicTacToe";

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

  const { component: GameComponent, title } = GAME_REGISTRY[gameName];

  // Render the game component with breadcrumb and back button
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2"
          >
            <Link href="/games">
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        </div>
        <BreadCrumbCom
          crumbs={[{ name: "Games", href: "games" }]}
          endtrail={title}
        />
      </div>
      <GameComponent />
    </div>
  );
}

// Generate static params for all games (optional, for better performance)
export async function generateStaticParams() {
  return Object.keys(GAME_REGISTRY).map((gameName) => ({
    gameName,
  }));
}

