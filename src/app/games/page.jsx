"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import BreadCrumbCom from "@/components/shared/BreadCrumb"

const images = [
  {
    id: 1,
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5WtLuFq4E0OO9-iuBCMu0JMk-4cz1n88vbQ&s.jpg",
    alt: "Tic Tac Toe",
    genre: "Brain Teaser",
    route: "/games/tic-tac-toe",
  },
  {
    id: 2,
    src: "https://www.memozor.com/templates/memoire/images/zoom/memory_game_adults_emoji.jpg",
    alt: "Emoji Memory",
    genre: "Brain Teaser",
    route: "/games/memory-game",
  },
  {
    id: 3,
    src: "https://bloximages.newyork1.vip.townnews.com/gpkmedia.com/content/tncms/assets/v3/editorial/a/2d/a2d138e6-1dcc-11ef-836d-77c372bd89be/665743cd601a2.image.jpg?resize=389%2C243.jpg",
    alt: "The Guessing Game",
    genre: "Brain Teaser",
    route: "/games/guessing-game",
  },
  {
    id: 4,
    src: "https://hips.hearstapps.com/hmg-prod/images/people-playing-paper-rock-scissors-royalty-free-illustration-1583269312.jpg",
    alt: "Rock Paper Scissors",
    genre: "Brain Teaser",
    route: "/games/rock-paper-scissors",
  },
];

export default function GameSelectPage() {
  return (
    <section className="px-10 w-full pt-9 bg-[var(--background)]">
      <BreadCrumbCom endtrail="Games" />
      <div className=" flex flex-col items-center justify-center p-4">
        <h2 className="my-10 text-2xl font-bold border-b-2 border-teal-500">
          Select a Game to play
        </h2>
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
                  <p className="text-[var(--accent)]">{image.genre}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
