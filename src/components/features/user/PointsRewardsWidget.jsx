"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePointsStore } from "@/app/store/pointsStore";
import api from "@/utils/axios";
import { Trophy, Star, Gift, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATION, UI } from "@/constants";
import { handleErrorWithNotification } from "@/utils/notifications";

export default function PointsRewardsWidget() {
  const { points, lifetimePoints, dailyStatus, fetchUserData, isLoading } = usePointsStore();
  const [completedTopics, setCompletedTopics] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [animatedLifetime, setAnimatedLifetime] = useState(0);

  // Daily points calculations based on admin settings
  const todaysPoints = dailyStatus?.todaysPoints || 0;
  const dailyLimit = dailyStatus?.dailyLimit || 100000; // Fallback to default
  const remainingPoints = dailyLimit - todaysPoints;
  const progressPercentage = (todaysPoints / dailyLimit) * 100;
  const isLimitReached = remainingPoints <= 0;

  // Fetch user stats for completed topics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        await fetchUserData();
        const response = await api.get("/user/stats");

        // API returns { success: true, data: {...} }
        const statsData = response.data?.data || response.data;
        if (statsData?.categoryStats) {
          const completed = statsData.categoryStats.filter(
            stat => stat.completed > 0
          ).length;
          setCompletedTopics(completed);
        }
      } catch (error) {
        handleErrorWithNotification(error, "Failed to load statistics");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [fetchUserData]);

  // Animated counter effect for points
  useEffect(() => {
    const duration = ANIMATION.DURATION_MS;
    const steps = ANIMATION.STEPS;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedPoints(Math.floor(points * easeOut));
      setAnimatedLifetime(Math.floor(lifetimePoints * easeOut));

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedPoints(points);
        setAnimatedLifetime(lifetimePoints);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [points, lifetimePoints]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <Card className="w-full h-full bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500" />

      <CardHeader className="relative z-10">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          Points & Rewards
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Current Points - Large Display */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-6 shadow-md hover:shadow-xl transition-all duration-300 group/points">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover/points:scale-110 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 group-hover/points:scale-110 transition-transform duration-500" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-sm font-medium text-white/90">Current Points</span>
            </div>
            <div className="text-4xl font-extrabold text-white mb-1 tracking-tight">
              {isLoading || statsLoading ? (
                <div className="h-10 w-32 bg-white/20 rounded-lg animate-pulse" />
              ) : (
                formatNumber(animatedPoints)
              )}
            </div>
            <div className="flex items-center gap-1 text-white/80 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Available to spend</span>
            </div>
          </div>
        </div>

        {/* Daily Points Progress */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isLimitReached ? "bg-red-500" : "bg-green-500 animate-pulse"
              )} />
              <span className="text-sm font-semibold text-gray-700">Today&apos;s Progress</span>
            </div>
            <span className="text-xs text-gray-500">
              {formatNumber(todaysPoints)} / {formatNumber(dailyLimit)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                isLimitReached
                  ? "bg-gradient-to-r from-red-400 to-red-500"
                  : "bg-gradient-to-r from-purple-500 to-blue-500"
              )}
              style={{ width: `${Math.min(progressPercentage, UI.MAX_PERCENTAGE)}%` }}
            />
          </div>

          {/* Status Text */}
          <div className="text-xs">
            {isLimitReached ? (
              <div className="flex items-center gap-1.5 text-red-600">
                <span className="font-medium">Daily limit reached!</span>
                <span className="text-gray-500">• Resets at midnight</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-600">
                <span className="font-medium text-green-600">{formatNumber(remainingPoints)} earnable points</span>
                <span>remaining today</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Lifetime Points */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 group/stat">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg group-hover/stat:scale-110 transition-transform duration-300">
                <Star className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600">Lifetime</span>
            </div>
            {isLoading || statsLoading ? (
              <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(animatedLifetime)}
              </div>
            )}
          </div>

          {/* Completed Topics */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group/stat">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg group-hover/stat:scale-110 transition-transform duration-300">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600">Topics</span>
            </div>
            {isLoading || statsLoading ? (
              <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {completedTopics}
              </div>
            )}
          </div>
        </div>

        {/* Rewards Link - Call to Action */}
        <Link
          href="/rewards"
          className="block w-full"
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-4 hover:shadow-lg transition-all duration-300 group/cta cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm group-hover/cta:scale-110 transition-transform duration-300">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Browse Rewards</div>
                  <div className="text-white/80 text-xs">Redeem your points</div>
                </div>
              </div>
              <div className="text-white group-hover/cta:translate-x-1 transition-transform duration-300">
                →
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Stats Footer */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Keep earning points!</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
