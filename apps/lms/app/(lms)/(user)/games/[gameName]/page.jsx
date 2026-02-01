"use client";

import { notFound, useParams } from 'next/navigation';
import React, { use } from 'react';
import GuessingGame from "@/components/games/GuessingGame";
import MemoryGame from "@/components/games/MemoryGame";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import TicTacToe from "@/components/games/TicTacToe";
import GameRunner from "@/components/games/GameRunner";

// Game registry: maps URL-friendly game names to their components
const GAME_REGISTRY = {
  'guessing-game': {
    component: GuessingGame,
    title: 'The Guessing Game',
    gameTitle: 'Number Wizard',
    rules: [
      "Guess the secret number between 1 and 100.",
      "Receive 'Higher' or 'Lower' hints after each guess.",
      "Try to find the number in as few attempts as possible."
    ],
    tip: "Use binary search! Start by guessing 50, then half the remaining range each time.",
    personalBest: 12500,
    globalRank: "#128"
  },
  'memory-game': {
    component: MemoryGame,
    title: 'Emoji Memory',
    gameTitle: 'Mind Match',
    rules: [
      "Flip two cards to find matching emojis.",
      "Remember the positions of cards to clear the board faster.",
      "Try to match all pairs within the time limit."
    ],
    tip: "Start with the corners! People often remember corner positions better than middle ones.",
    personalBest: 8400,
    globalRank: "#85"
  },
  'rock-paper-scissors': {
    component: RockPaperScissors,
    title: 'Battle Royale',
    gameTitle: 'Rock Paper Scissors',
    rules: [
      "Rock beats Scissors, Scissors beats Paper, and Paper beats Rock.",
      "Play against the AI and try to win the round.",
      "The first to reach the score goal wins the game."
    ],
    tip: "Watch out for patterns! AI often repeats its winning choice in simple modes.",
    personalBest: 3200,
    globalRank: "#210"
  },
  'tic-tac-toe': {
    component: TicTacToe,
    title: 'Logic Duel',
    gameTitle: 'Tic Tac Toe',
    rules: [
      "Players take turns placing their marks (X or O) on the 3x3 grid.",
      "The goal is to align 3 of your marks vertically, horizontally, or diagonally.",
      "If all 9 squares are filled and no one has 3 in a row, the game is a draw."
    ],
    tip: "Control the center square early! In Tic Tac Toe, the center is involved in 4 different winning lines.",
    personalBest: 4800,
    globalRank: "#42"
  },
};

export default function GamePage() {
  const params = useParams();
  const gameName = params.gameName;

  // Check if game exists in registry
  if (!gameName || !GAME_REGISTRY[gameName]) {
    return notFound();
  }

  const gameConfig = GAME_REGISTRY[gameName];

  return (
    <GameRunner
      gameConfig={gameConfig}
      GameComponent={gameConfig.component}
    />
  );
}
