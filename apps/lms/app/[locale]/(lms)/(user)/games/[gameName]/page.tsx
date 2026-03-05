"use client";

import { notFound, useParams } from 'next/navigation';
import React from 'react';
import GuessingGame from "@/components/games/GuessingGame";
import MemoryGame from "@/components/games/MemoryGame";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import TicTacToe from "@/components/games/TicTacToe";
import GameRunner from "@/components/games/GameRunner";
import { useTranslations } from "next-intl";

const GAME_SLUGS = ['guessing-game', 'memory-game', 'rock-paper-scissors', 'tic-tac-toe'] as const;
const GAME_REGISTRY = {
  'guessing-game': { component: GuessingGame, configKey: 'guessingGame' as const },
  'memory-game': { component: MemoryGame, configKey: 'memoryGame' as const },
  'rock-paper-scissors': { component: RockPaperScissors, configKey: 'rockPaperScissors' as const },
  'tic-tac-toe': { component: TicTacToe, configKey: 'ticTacToe' as const },
} as const;

export default function GamePage() {
  const t = useTranslations("gameRegistry");
  const params = useParams();
  const gameName = (Array.isArray(params.gameName) ? params.gameName[0] : params.gameName) as string | undefined;

  if (!gameName || !(GAME_REGISTRY as Record<string, unknown>)[gameName]) {
    return notFound();
  }

  const entry = GAME_REGISTRY[gameName as keyof typeof GAME_REGISTRY];
  const config = t.raw(entry.configKey) as { title: string; gameTitle: string; rules: string[]; tip: string };
  const personalBests: Record<string, number> = { 'guessing-game': 12500, 'memory-game': 8400, 'rock-paper-scissors': 3200, 'tic-tac-toe': 4800 };
  const globalRanks: Record<string, string> = { 'guessing-game': '#128', 'memory-game': '#85', 'rock-paper-scissors': '#210', 'tic-tac-toe': '#42' };

  const gameConfig = {
    title: config.title,
    gameTitle: config.gameTitle,
    rules: config.rules,
    tip: config.tip,
    personalBest: personalBests[gameName] ?? 0,
    globalRank: globalRanks[gameName] ?? "Unranked",
  };

  return (
    <GameRunner
      gameConfig={gameConfig}
      GameComponent={entry.component}
    />
  );
}
