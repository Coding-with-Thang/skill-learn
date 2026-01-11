"use client";

import Link from "next/link";
import { Card } from "@skill-learn/ui/components/card";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import {
  X,
  Circle,
  Smile,
  Gamepad2,
  HelpCircle,
  Scissors,
  Hand,
  MoveRight,
  Plus,
  Globe
} from "lucide-react";

// Game data with icon components/configurations for the visual area
const games = [
  {
    id: 1,
    title: "Tic Tac Toe",
    description: "Classic strategy. Get three in a row to win against the AI.",
    genre: "Strategy",
    route: "/games/tic-tac-toe",
    gameName: "tic-tac-toe",
    genreColor: "bg-blue-100 text-blue-600",
    renderIcon: () => (
      <div className="relative w-24 h-24 grid grid-cols-2 gap-2 opacity-80">
        <div className="flex items-center justify-center border-r-2 border-b-2 border-gray-300">
          {/* Top Left - Empty */}
        </div>
        <div className="flex items-center justify-center border-b-2 border-gray-300">
          <X className="w-10 h-10 text-blue-500" />
        </div>
        <div className="flex items-center justify-center border-r-2 border-gray-300">
          <Circle className="w-8 h-8 text-red-400" />
        </div>
        <div className="flex items-center justify-center">
          <X className="w-10 h-10 text-blue-500" />
        </div>
        {/* Simple grid lines imitation */}
      </div>
    )
  },
  {
    id: 2,
    title: "Emoji Memory",
    description: "Test your recall. Match the pairs of emojis before time runs out.",
    genre: "Brain Teaser",
    route: "/games/memory-game",
    gameName: "memory-game",
    genreColor: "bg-yellow-100 text-yellow-700",
    renderIcon: () => (
      <div className="grid grid-cols-2 gap-3">
        <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center shadow-sm">
          <Smile className="w-7 h-7 text-yellow-600" />
        </div>
        <div className="w-12 h-12 bg-indigo-500 rounded-lg shadow-sm"></div>
        <div className="w-12 h-12 bg-indigo-500 rounded-lg shadow-sm"></div>
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
          <Gamepad2 className="w-7 h-7 text-blue-500" />
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "The Guessing Game",
    description: "Can you guess the hidden number? Sharpen your intuition.",
    genre: "Logic",
    route: "/games/guessing-game",
    gameName: "guessing-game",
    genreColor: "bg-green-100 text-green-700",
    renderIcon: () => (
      <div className="relative">
        <div className="w-20 h-24 bg-white rounded-xl shadow-md flex items-center justify-center border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-green-600" />
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Rock Paper Scissors",
    description: "The timeless hand game. Luck or psychology? You decide.",
    genre: "Casual",
    route: "/games/rock-paper-scissors",
    gameName: "rock-paper-scissors",
    genreColor: "bg-pink-100 text-pink-700",
    renderIcon: () => (
      <div className="flex gap-4 items-center opacity-70">
        <Hand className="w-10 h-10 text-gray-600 -rotate-45" />
        <Scissors className="w-10 h-10 text-gray-600 rotate-12" />
        <Globe className="w-10 h-10 text-gray-600" />
      </div>
    )
  }
];

export default function GameSelectPage() {
  return (
    <section className="w-full min-h-screen bg-[var(--background)] pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <BreadCrumbCom endtrail="Games" />

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative inline-block mb-4">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Select a Game to Play
            </h1>
            <div className="h-1 w-20 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <p className="max-w-2xl text-lg text-muted-foreground mt-4 leading-relaxed">
            Take a quick break and challenge your mind with our collection of brain
            teasers. Earn points while you play!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {games.map((game) => (
            <Link key={game.id} href={game.route} className="block group h-full">
              <Card className="h-full border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card overflow-hidden rounded-2xl flex flex-col">
                <div className="h-56 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ease-in-out p-6">
                  {game.renderIcon()}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-blue-600 transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                    {game.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${game.genreColor}`}>
                      {game.genre}
                    </span>
                    <MoveRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/20">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4 text-gray-400">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">
            More games coming soon!
          </h3>
        </div>
      </div>
    </section>
  );
}
