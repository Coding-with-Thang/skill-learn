"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

const images = [
  {
    id: 1,
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5WtLuFq4E0OO9-iuBCMu0JMk-4cz1n88vbQ&s.jpg",
    alt: "Tic Tac Toe",
    route: "/games/tic-tac-toe",
  },
  {
    id: 2,
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuvU-iyIIIykVjDCiYitInpN_SAmCDESBVYg&s.jpg",
    alt: "Coin Toss",
    route: "/games/coin-toss",
  },
  {
    id: 3,
    src: "https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/mdn-breakout-gameplay.png",
    alt: "Brick Breaker",
    route: "/games/brick-breaker",
  },
];

export default function GameSelectPage() {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <div>
        <h1 className="text-md">Gamify your knowledge - have a blast learning</h1>
        <h2 className="mb-5 text-2xl font-bold border-b-2 border-orange-500">
          Select a Game to play
        </h2>
      </div>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((image) => (
            <Link key={image.id} href={image.route}>
              <Card className="cursor-pointer overflow-hidden transition-transform hover:scale-105">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{image.alt}</h2>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
