"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import api from "@skill-learn/lib/utils/axios";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card";
import { FeatureGate, FeatureDisabledPage } from "@skill-learn/ui/components/feature-gate";
import BreadCrumbCom from "@/components/shared/BreadCrumb";
import { cn } from "@skill-learn/lib/utils";
import { Trophy, Award } from "lucide-react";

const PodiumPosition = ({ user, position, metric }) => {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  const avatarSize = isFirst ? 96 : isSecond ? 80 : 64;

  const colorClass = isFirst
    ? "border-yellow-400 text-yellow-600"
    : isSecond
      ? "border-gray-300 text-gray-500"
      : "border-amber-600 text-amber-700";
  const bgClass = isFirst
    ? "bg-yellow-50"
    : isSecond
      ? "bg-gray-50"
      : "bg-amber-50";

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        isFirst ? "order-2 -mt-4" : isSecond ? "order-1" : "order-3"
      )}
    >
      <div className="relative mb-2">
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
        <div
          className={cn(
            "absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm",
            isFirst
              ? "bg-yellow-400"
              : isSecond
                ? "bg-gray-400"
                : "bg-amber-600"
          )}
        >
          {position}
        </div>
        {isFirst && (
          <Trophy className="absolute -top-6 right-0 text-yellow-400 w-6 h-6 animate-bounce" />
        )}
      </div>

      <div
        className={cn(
          "flex flex-col items-center mt-3 p-3 rounded-xl border w-full min-w-[100px] text-center",
          colorClass,
          "bg-white border-opacity-30"
        )}
      >
        <span className="font-bold text-gray-800 text-sm truncate w-24">
          {user.username || "User"}
        </span>
        <span className="font-extrabold text-blue-600 text-lg">
          {metric === "points"
            ? user.totalPoints?.toLocaleString()
            : `${user.averageScore?.toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
};

const LeaderboardTable = ({ data, type, t }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">{t("noDataAvailable")}</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left">{t("rank")}</th>
            <th className="px-6 py-3 text-left">{t("user")}</th>
            {type === "points" ? (
              <th className="px-6 py-3 text-right">{t("totalPoints")}</th>
            ) : (
              <>
                <th className="px-6 py-3 text-right">{t("averageScore")}</th>
                <th className="px-6 py-3 text-right">{t("quizzesTaken")}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={entry.id || index} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4">{entry.rank}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt={entry.username || "User"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                      {(entry.username || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <span>{entry.username || t("anonymous")}</span>
                </div>
              </td>
              {type === "points" ? (
                <td className="px-6 py-4 text-right">
                  {entry.totalPoints?.toLocaleString()}
                </td>
              ) : (
                <>
                  <td className="px-6 py-4 text-right">
                    {entry.averageScore?.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    {entry.quizzesTaken || 0}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");
  const [activeTab, setActiveTab] = useState("points");
  const [pointsData, setPointsData] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isSignedIn || !isLoaded) {
      setIsLoading(false);
      return;
    }

    const fetchLeaderboards = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [pointsResponse, quizResponse] = await Promise.all([
          api.get("/leaderboard/points"),
          api.get("/leaderboard/quiz-score"),
        ]);

        // API returns { success: true, data: { leaderboard: [...] } }
        const pointsData = pointsResponse.data?.data || pointsResponse.data;
        const quizData = quizResponse.data?.data || quizResponse.data;

        setPointsData(pointsData?.leaderboard || pointsData || []);
        setQuizData(quizData?.leaderboard || quizData || []);
      } catch (err) {
        console.error("Error fetching leaderboards:", err);
        setError(t("failedToLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboards();
  }, [isSignedIn, isLoaded]);

  const currentData = activeTab === "points" ? pointsData : quizData;
  const topThree = currentData.slice(0, 3);
  const remaining = currentData.slice(3);

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">{t("loading")}</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">
            {t("pleaseSignIn")}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate
      feature="leaderboards"
      featureName={t("title")}
      fallback={<FeatureDisabledPage featureName={t("title")} />}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BreadCrumbCom crumbs={[]} endtrail={t("title")} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-gray-500 mt-1">{t("subtitle")}</p>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("points")}
              className={cn(
                "px-4 py-2 rounded-4xld text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "points"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Trophy className="w-4 h-4" />
              {t("pointsLeaderboard")}
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={cn(
                "px-4 py-2 rounded-4xld text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "quiz"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Award className="w-4 h-4" />
              {t("quizLeaderboard")}
            </button>
          </div>
        </div>

        {/* Top 3 Podium */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">
              {activeTab === "points" ? t("topPointsLeaders") : t("topQuizPerformers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topThree.length > 0 ? (
              <div className="flex justify-center items-end gap-2 md:gap-6 mt-4 pb-4">
                {topThree[1] && (
                  <PodiumPosition
                    user={topThree[1]}
                    position={2}
                    metric={activeTab}
                  />
                )}
                {topThree[0] && (
                  <PodiumPosition
                    user={topThree[0]}
                    position={1}
                    metric={activeTab}
                  />
                )}
                {topThree[2] && (
                  <PodiumPosition
                    user={topThree[2]}
                    position={3}
                    metric={activeTab}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("noDataAvailable")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Leaderboard Table */}
        {remaining.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t("fullRankings")}</h2>
            <LeaderboardTable data={remaining} type={activeTab} t={t} />
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
