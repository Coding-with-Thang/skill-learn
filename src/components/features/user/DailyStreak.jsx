"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Circle, Flame, Trophy, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePointsStore } from "@/app/store/pointsStore";
import { cn } from "@/lib/utils";

export default function DailyStreak() {
  const { streak, fetchDailyStatus } = usePointsStore();

  useEffect(() => {
    fetchDailyStatus();
  }, [fetchDailyStatus]);

  const progressToMilestone = ((streak.current % 5) / 5) * 100;

  return (
    <Card className="w-full p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Daily Streak
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Keep your streak alive by earning points daily!
            </p>
          </div>
          {streak.atRisk && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Streak at risk!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Current Streak */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 p-1">
              <div className="bg-white rounded-full p-4">
                <span className="text-4xl font-bold">{streak.current}</span>
              </div>
            </div>
            <p className="mt-2 font-medium text-gray-600">Current Streak</p>
          </div>

          {/* Progress to Next Milestone */}
          <div className="flex flex-col justify-center">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {streak.nextMilestone} days</span>
                <span>{streak.pointsToNextMilestone} days left</span>
              </div>
              <Progress value={progressToMilestone} className="h-2" />
            </div>
          </div>

          {/* Longest Streak */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold">{streak.longest}</span>
              <p className="text-sm font-medium text-gray-600">Longest Streak</p>
            </div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="pt-4 border-t">
          <div className="flex gap-2 justify-center items-center">
            {[...Array(7)].map((_, i) => {
              const isActive = i < (streak.current % 7);
              return (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isActive
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <Circle
                    className={cn(
                      "w-4 h-4",
                      isActive ? "fill-orange-600" : "fill-gray-400"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
} 