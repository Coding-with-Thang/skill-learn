"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/utils/axios";
import { useUser } from "@clerk/nextjs";

const PodiumPosition = ({ user, position }) => {
  const medals = {
    1: { color: "bg-yellow-500", size: "w-24 h-24" },
    2: { color: "bg-gray-400", size: "w-20 h-20" },
    3: { color: "bg-amber-700", size: "w-16 h-16" },
  };

  const imageSize = position === 1 ? 96 : position === 2 ? 80 : 64;

  return (
    <div
      className={`flex flex-col items-center ${position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3"
        }`}
    >
      <div
        className={`${medals[position].color
          } rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mb-2`}
      >
        {position}
      </div>
      <div className="flex flex-col items-center">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.username || "User"}
            width={imageSize}
            height={imageSize}
            className="rounded-full object-cover"
          />
        ) : (
          <div
            className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold`}
            style={{ width: imageSize, height: imageSize }}
          >
            {(user.username || "?")[0].toUpperCase()}
          </div>
        )}
        <p className="font-bold mt-2">{user.username || "Anonymous"}</p>
        <p className="text-sm">
          {user.totalPoints !== undefined
            ? `${user.totalPoints.toLocaleString()} pts`
            : user.averageScore !== undefined
              ? `${user.averageScore.toFixed(1)}%`
              : "N/A"}
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
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboards = async () => {
      // Don't fetch if not signed in
      if (!isSignedIn || !isLoaded) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [pointsData, quizData] = await Promise.all([
          api.get("/leaderboard/points"),
          api.get("/leaderboard/quiz-score"),
        ]);

        if (isMounted) {
          setPointsLeaderboard(pointsData.data.leaderboard.slice(0, 3));
          setQuizLeaderboard(quizData.data.leaderboard.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching leaderboards:", error);
        if (isMounted) {
          if (error.response?.status === 401) {
            setError("Please sign in to view leaderboards");
          } else {
            setError("Failed to load leaderboards");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboards();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        Loading leaderboards...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        Please sign in to view leaderboards
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
    <section className="w-full max-w-3xl mx-auto flex flex-col gap-8 items-center">
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-xl font-bold">Top Learners</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <div className="flex justify-center items-end gap-4 py-8 w-full sm:w-auto">
              {pointsLeaderboard.map((user, index) => (
                <PodiumPosition key={user.id} user={user} position={index + 1} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-5 flex-wrap w-full">
        <Card className="w-full sm:w-[400px]">
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

        <Card className="w-full sm:w-[400px]">
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
