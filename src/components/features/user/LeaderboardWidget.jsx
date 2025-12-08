"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/utils/axios";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

const PodiumPosition = ({ user, position, metric }) => {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  const height = isFirst ? "h-32" : isSecond ? "h-24" : "h-20"; // box height
  const avatarSize = isFirst ? 80 : isSecond ? 64 : 56;

  // Colors for rings/badges
  const colorClass = isFirst ? "border-yellow-400 text-yellow-600" : isSecond ? "border-gray-300 text-gray-500" : "border-amber-600 text-amber-700";
  const bgClass = isFirst ? "bg-yellow-50" : isSecond ? "bg-gray-50" : "bg-amber-50";

  return (
    <div className={cn("flex flex-col items-center", isFirst ? "order-2 -mt-4" : isSecond ? "order-1" : "order-3")}>
      <div className="relative mb-2">
        {/* Avatar */}
        <div className={cn("rounded-full border-4 p-1", colorClass, bgClass)}>
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.username || "User"}
              width={avatarSize}
              height={avatarSize}
              className="rounded-full object-cover"
            />
          ) : (
            <div
              style={{ width: avatarSize, height: avatarSize }}
              className="rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl"
            >
              {(user.username || "?")[0].toUpperCase()}
            </div>
          )}
        </div>
        {/* Rank Badge */}
        <div className={cn(
          "absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm",
          isFirst ? "bg-yellow-400" : isSecond ? "bg-gray-400" : "bg-amber-600"
        )}>
          {position}
        </div>
        {isFirst && <Trophy className="absolute -top-6 right-0 text-yellow-400 w-6 h-6 animate-bounce" />}
      </div>

      <div className={cn("flex flex-col items-center mt-3 p-3 rounded-xl border w-full min-w-[100px] text-center", colorClass, "bg-white border-opacity-30")}>
        <span className="font-bold text-gray-800 text-sm truncate w-24">{user.username || "User"}</span>
        <span className="font-extrabold text-blue-600 text-lg">
          {metric === 'points'
            ? user.totalPoints?.toLocaleString()
            : user.quizCount || user.averageScore?.toFixed(0) // Assuming quiz data structure
          }
        </span>
      </div>
    </div>
  );
};

export default function LeaderboardWidget() {
  const [activeTab, setActiveTab] = useState("points"); // 'points' or 'lessons'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch based on active tab
        const endpoint = activeTab === "points" ? "/leaderboard/points" : "/leaderboard/quiz-score";
        const response = await api.get(endpoint);
        setLeaderboardData(response.data.leaderboard.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, isSignedIn, isLoaded]);

  return (
    <Card className="w-full h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Leaderboard</CardTitle>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("points")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", activeTab === "points" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
          >
            Points
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", activeTab === "lessons" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
          >
            Lessons
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
        ) : leaderboardData.length > 0 ? (
          <div className="flex justify-center items-end gap-2 md:gap-6 mt-4 pb-4">
            {leaderboardData[1] && <PodiumPosition user={leaderboardData[1]} position={2} metric={activeTab} />}
            {leaderboardData[0] && <PodiumPosition user={leaderboardData[0]} position={1} metric={activeTab} />}
            {leaderboardData[2] && <PodiumPosition user={leaderboardData[2]} position={3} metric={activeTab} />}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}
