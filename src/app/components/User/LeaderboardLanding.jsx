"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/utils/axios";

const PodiumPosition = ({ user, position }) => {
  const medals = {
    1: { color: "bg-yellow-500", size: "w-24 h-24" },
    2: { color: "bg-gray-400", size: "w-20 h-20" },
    3: { color: "bg-amber-700", size: "w-16 h-16" },
  };

  return (
    <div
      className={`flex flex-col items-center ${position === 1
        ? "order-2"
        : position === 2
          ? "order-1"
          : "order-3"
        }`}
    >
      <div
        className={`${medals[position].color
          } rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mb-2`}
      >
        {position}
      </div>
      <div className="flex flex-col items-center">
        <Image
          src={user.image}
          alt={user.name}
          width={position === 1 ? 96 : position === 2 ? 80 : 64}
          height={position === 1 ? 96 : position === 2 ? 80 : 64}
          className="rounded-full"
        />
        <p className="font-bold mt-2">{user.name}</p>
        <p className="text-sm">
          {user.totalPoints
            ? `${user.totalPoints} pts`
            : `${user.averageScore.toFixed(1)}%`}
        </p>
      </div>
    </div>
  );
};

export default function LeaderboardLanding() {
  const [pointsLeaderboard, setPointsLeaderboard] = useState([]);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [pointsData, quizData] = await Promise.all([
          api.get("/api/leaderboard/points"),
          api.get("/api/leaderboard/quiz-score"),
        ]);

        setPointsLeaderboard(pointsData.slice(0, 3));
        setQuizLeaderboard(quizData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching leaderboards:", error);
        setError("Failed to load leaderboards");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        Loading leaderboards...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-red-500">
        {error}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5 mb-9 w-full mx-auto justify-center items-center">
      <h3 className="text-xl font-bold">Leaderboards</h3>
      <div className="flex gap-5 flex-wrap">
        <Card className="w-[400px]">
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
          <CardContent>
            <div className="flex justify-center items-end gap-4 py-8">
              {pointsLeaderboard.map((user, index) => (
                <PodiumPosition key={user.id} user={user} position={index + 1} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-[400px]">
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
          <CardContent>
            <div className="flex justify-center items-end gap-4 py-8">
              {quizLeaderboard.map((user, index) => (
                <PodiumPosition key={user.id} user={user} position={index + 1} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
