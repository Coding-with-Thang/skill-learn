"use client"

import { useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Award, Calendar, Gift, Star, Clock } from "lucide-react";
import usePointsStore from "../../store/pointsStore";

export default function UserBadge() {
  const { user, isLoaded } = useUser();
  const { pointStatus, loading, earning, fetchStatus, earnPoints } = usePointsStore();

  // Fetch points status on component mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleEarnPoints = async () => {
    if (!pointStatus?.canEarnPoints) return;

    const result = await earnPoints(10, "Button pressed");
  };


  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-[50rem] h-full w-full flex flex-col items-center justify-center bg-[url(/user_background.jpg)] bg-no-repeat bg-cover bg-center text-white">
      <Image
        src={user?.imageUrl || "/user.png"}
        alt="Profile Image"
        width={200}
        height={200}
        className="rounded-full border-2 shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
      />
      <h2 className="text-4xl my-6">Welcome,{user?.firstName} {" "} {user?.lastName}!</h2>
      <p className="text-xl">You can earn up to 100 reward points today.</p>

      <div className="mt-10 px-10 bg-[rgba(0,0,0,0.25)] grid grid-cols-3 gap-6 rounded-md">
        <div className="p-4">
          <p className="font-bold text-4xl">100</p>
          <p className="text-xl">Current Reward Points</p>
        </div>
        <div className="p-4">
          <p className="font-bold text-4xl">10,100</p>
          <p className="text-xl">All Time Reward Points</p>
        </div>
        <div className="p-4">
          <p className="font-bold text-4xl">10</p>
          <p className="text-xl">Training Sessions Last 30 Days</p>
        </div>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Points Dashboard
          </CardTitle>
          <CardDescription>
            Earn up to 100 points each day by pressing the button
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Daily Points Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                Today's Points
              </h3>
              <span className="text-sm font-medium">
                {pointStatus?.todaysPoints || 0}/100
              </span>
            </div>
            <Progress value={pointStatus?.todaysPoints || 0} max={100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {pointStatus?.canEarnPoints
                ? `You can earn ${100 - (pointStatus?.todaysPoints || 0)} more points today`
                : "Daily limit reached"}
            </p>
          </div>

          {/* Lifetime Points Section */}
          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                Lifetime Points
              </h3>
            </div>
            <p className="text-3xl font-bold text-center py-2">
              {pointStatus?.lifetimePoints || 0}
            </p>
          </div>

          {/* Earn Points Button */}
          <Button
            onClick={handleEarnPoints}
            disabled={!pointStatus?.canEarnPoints || earning}
            size="lg"
            className="w-full"
          >
            {earning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Earning...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-5 w-5" />
                Collect 10 Points
              </>
            )}
          </Button>

          {/* Today's Activity Log */}
          {pointStatus?.todaysLogs && pointStatus.todaysLogs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Today's Activity
              </h3>
              <hr />
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pointStatus.todaysLogs.map((log) => (
                  <div key={log.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{log.reason}</span>
                    <span className="font-medium">+{log.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground w-full text-center">
            Points reset daily at midnight
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}