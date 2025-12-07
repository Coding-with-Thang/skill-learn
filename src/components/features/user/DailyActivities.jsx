"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Play, Award, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { usePointsStore } from "@/app/store/pointsStore";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DAILY_POINTS_LIMIT = 100000;

export default function DailyActivities() {
  const { dailyStatus, fetchUserData, isLoading } = usePointsStore();

  useEffect(() => {
    // The data will be fetched by UserBadge, no need to fetch again
    // Just subscribe to updates
    const checkData = async () => {
      if (!dailyStatus) {
        await fetchUserData();
      }
    };
    checkData();
  }, [fetchUserData, dailyStatus]);

  const todaysPoints = dailyStatus?.todaysPoints || 0;
  const remainingPoints = DAILY_POINTS_LIMIT - todaysPoints;
  const progressPercentage = (todaysPoints / DAILY_POINTS_LIMIT) * 100;
  const isLimitReached = remainingPoints <= 0;

  // Format large numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <Card className="w-full p-6 space-y-6">
      <h1 className="text-3xl font-bold">Today&apos;s Activities</h1>

      {/* Points Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Daily Points Progress</span>
          </div>
          <span className="text-sm text-gray-600">{formatNumber(todaysPoints)}/{formatNumber(DAILY_POINTS_LIMIT)} points</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />

        {isLimitReached ? (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-600">
              Daily point limit reached! You can still participate in activities, but you won&apos;t earn additional points until tomorrow.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-sm text-gray-600">
            {formatNumber(remainingPoints)} points remaining to earn today!
          </p>
        )}
      </div>

      {/* Activities */}
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-green-500">
            <RefreshCcw width={24} height="24" className="text-gray-50 text-4xl" />
          </div>
          <h2 className="text-2xl text-gray-900">Daily Questions</h2>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full bg-blue-900 text-gray-50 text-lg hover:bg-blue-800"
          >
            <Link href="/training" className="flex gap-2 justify-center items-center w-full">
              <Play />Start Training
            </Link>
          </Button>

          <Button
            className="w-full bg-blue-900 text-gray-50 text-lg hover:bg-blue-800"
          >
            <Link href="/games" className="flex gap-2 justify-center items-center w-full">
              <Play />Play A Game
            </Link>
          </Button>
        </div>
      </div>

      {/* Time Until Reset */}
      <div className="pt-4 border-t">
        <p className="text-sm text-gray-600">
          Points reset at midnight in your local timezone
        </p>
      </div>
    </Card>
  );
}
