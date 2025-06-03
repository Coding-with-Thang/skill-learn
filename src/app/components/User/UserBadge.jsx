"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { usePointsStore } from "@/app/store/pointsStore"
import formatNumber from "@/utils/formatNumbers";

export default function UserBadge() {
  const { user, isLoaded } = useUser();
  const { points, lifetimePoints, fetchPoints, addPoints, isLoading, fetchDailyStatus } = usePointsStore();
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

  useEffect(() => {
    fetchDailyStatus();
  }, [fetchDailyStatus]);

  const handleClick = async () => {
    if (cooldown > 0 || isLoading) return;

    await addPoints(pointsToAward, 'button_click');
    setCooldown(cooldownInSeconds);
  };

  return (
    <div
      className="relative min-h-[50rem] h-full w-full flex flex-col items-center justify-center bg-[url(/user_background.jpg)] bg-no-repeat bg-cover bg-center text-white overflow-hidden animate-fadeIn"
      aria-label="User Badge Section"
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50 z-0" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <Image
          src={user?.imageUrl || "/user.png"}
          alt={user ? `${user.firstName} ${user.lastName} profile image` : "Default profile image"}
          width={200}
          height={200}
          className="rounded-full border-4 border-white/30 shadow-lg bg-white/10 object-cover"
          priority
        />
        <h2 className="text-4xl font-bold my-6 drop-shadow-lg text-center">
          {user ? `Welcome, ${user.firstName} ${user.lastName}!` : "Welcome!"}
        </h2>
        {/* <p className="text-xl">You can earn up to 100 reward points today.</p> */}
        {!isLoading ? (
          <>
            <div className="mt-10 px-4 sm:px-10 bg-white/20 backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-xl shadow-xl ring-1 ring-white/10 w-full max-w-3xl transition-all">
              <div className="p-4 flex flex-col items-center">
                <p className="font-bold text-4xl">{formatNumber(points)}</p>
                <p className="text-lg sm:text-xl text-white/90">Current Reward Points</p>
              </div>
              <div className="p-4 flex flex-col items-center">
                <p className="font-bold text-4xl">{formatNumber(lifetimePoints)}</p>
                <p className="text-lg sm:text-xl text-white/90">All Time Reward Points</p>
              </div>
              <div className="p-4 flex flex-col items-center">
                <p className="font-bold text-4xl">{formatNumber(10)}</p>
                <p className="text-lg sm:text-xl text-white/90">Training Sessions Last 30 Days</p>
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
        )}
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  )
}