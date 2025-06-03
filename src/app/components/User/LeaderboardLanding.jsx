"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LeaderboardLanding() {
  const [pointsLeaderboard, setPointsLeaderboard] = useState([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const [pointsRes, quizRes] = await Promise.all([
          fetch("/api/leaderboard/points"),
          fetch("/api/leaderboard/quiz-score"),
        ]);

        const pointsData = await pointsRes.json();
        const quizData = await quizRes.json();

        setPointsLeaderboard(pointsData.slice(0, 3));
        setQuizLeaderboard(quizData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching leaderboards:", error);
      }
    };

    fetchLeaderboards();
  }, []);

  return (
    <section className="flex flex-col gap-5 mb-9 w-full mx-auto justify-center items-center">
      <h3 className="text-xl font-bold">Leaderboards</h3>
      <div className="flex gap-5 flex-wrap">
        <Card className="w-[350px]">
          <CardHeader className="flex flex-row gap-5 items-center place-content-between">
            <h4 className="text-gray-900 font-bold m-0 p-0">
              Top Points Leaders
            </h4>
            <Link
              href="/leaderboard/points"
              className="text-gray-400 m-0 p-0"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ul className="flex flex-col gap-5">
              {pointsLeaderboard.map((user, index) => (
                <li key={user.id} className="flex items-center gap-4">
                  <span className="w-6 text-center">{index + 1}</span>
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="flex-1">{user.name}</span>
                  <span>{user.totalPoints} pts</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="w-[350px]">
          <CardHeader className="flex flex-row gap-5 items-center place-content-between">
            <h4 className="text-gray-900 font-bold m-0 p-0">
              Top Quiz Performers
            </h4>
            <Link
              href="/leaderboard/quiz-score"
              className="text-gray-400 m-0 p-0"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ul className="flex flex-col gap-5">
              {quizLeaderboard.map((user, index) => (
                <li key={user.id} className="flex items-center gap-4">
                  <span className="w-6 text-center">{index + 1}</span>
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="flex-1">{user.name}</span>
                  <span>{user.averageScore.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
