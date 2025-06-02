"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Award, Calendar, Gift, Star, Clock } from "lucide-react";
import { usePointsStore } from "@/app/store/pointsStore"
import formatNumber from "@/utils/formatNumbers";

export default function UserBadge() {
  const { user, isLoaded } = useUser();
  const { points, lifetimePoints, fetchPoints, addPoints, isLoading } = usePointsStore();
  const [cooldown, setCooldown] = useState(0);
  const pointsToAward = 10;
  const cooldownInSeconds = 5;

  // Fetch points status on component mount
  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleClick = async () => {
    if (cooldown > 0 || isLoading) return;

    await addPoints(pointsToAward, 'button_click');
    setCooldown(cooldownInSeconds);
  };

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
      {/* <p className="text-xl">You can earn up to 100 reward points today.</p> */}
      {!isLoading ? (
        <>
          <div className="mt-10 px-10 bg-[rgba(0,0,0,0.25)] grid grid-cols-3 gap-6 rounded-md">
            <div className="p-4">
              <p className="font-bold text-4xl">{isLoading ? '...' : formatNumber(points)}</p>
              <p className="text-xl">Current Reward Points</p>
            </div>
            <div className="p-4">
              <p className="font-bold text-4xl">{isLoading ? '...' : formatNumber(lifetimePoints)}</p>
              <p className="text-xl">All Time Reward Points</p>
            </div>
            <div className="p-4">
              <p className="font-bold text-4xl">{formatNumber(10)}</p>
              <p className="text-xl">Training Sessions Last 30 Days</p>
            </div>
          </div>

          {/* <Button
            onClick={handleClick}
            className="text-xl font-semibold mt-10 rounded-full bg-white/20 px-8 py-3 text-white"
            disabled={cooldown > 0 || isLoading}
          >
            {cooldown > 0 ? `Wait ${cooldown}s` : "Click here to earn 10 Points (Test)"}
          </Button> */}
        </>
      ) : (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )
      }
    </div>
  )
}