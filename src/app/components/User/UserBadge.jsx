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
      className="relative min-h-[50rem] h-full w-full flex flex-col items-center justify-center overflow-hidden animate-fadeIn"
      aria-label="User Badge Section"
      style={{
        backgroundColor: "#254117", // Chalkboard green
        backgroundImage: "url('/chalkboard_texture.png'), radial-gradient(circle at 20% 20%, #2e4a21 60%, #1a2a13 100%)",
        backgroundBlendMode: "multiply",
        border: "8px solid #fff",
        borderRadius: "32px",
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.5), 0 0 0 4px #eee8",
        outline: "2px dashed #fff8",
        outlineOffset: "8px",
      }}
    >
      {/* Chalk dust overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        background: "url('/chalk_dust.png') repeat",
        opacity: 0.15,
        mixBlendMode: "screen"
      }} aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <Image
          src={user?.imageUrl || "/user.png"}
          alt={user ? `${user.firstName} ${user.lastName} profile image` : "Default profile image"}
          width={160}
          height={160}
          className="rounded-full border-4 border-white/60 shadow-lg bg-white/10 object-cover mt-6"
          priority
        />
        <h2
          className="text-4xl font-bold my-6 drop-shadow-lg text-center"
          style={{
            fontFamily: "'Permanent Marker', 'Schoolbell', cursive, sans-serif",
            color: "#fff",
            textShadow: "0 2px 0 #fff8, 0 0 8px #fff8"
          }}
        >
          {user ? `Welcome, ${user.firstName}!` : "Welcome!"}
        </h2>
        {/* <p className="text-xl">You can earn up to 100 reward points today.</p> */}
        {!isLoading ? (
          <>
            <div className="mt-10 px-4 sm:px-10 bg-white/5 backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-xl shadow-xl ring-1 ring-white/10 w-full max-w-3xl transition-all border-2 border-white/30"
              style={{
                boxShadow: "0 2px 16px 0 #0006, 0 0 0 2px #fff4",
                fontFamily: "'Permanent Marker', 'Schoolbell', cursive, sans-serif",
              }}
            >
              <div className="p-4 flex flex-col justify-center items-center">
                <p className="font-bold text-4xl" style={{ color: "#fff", textShadow: "0 1px 0 #fff8" }}>{formatNumber(points)}</p>
                <p className="text-lg sm:text-xl text-white/90" style={{ color: "#fff" }}>Current Reward Points</p>
              </div>
              <div className="p-4 flex flex-col justify-center items-center">
                <p className="font-bold text-4xl" style={{ color: "#fff", textShadow: "0 1px 0 #fff8" }}>{formatNumber(lifetimePoints)}</p>
                <p className="text-lg sm:text-xl text-white/90" style={{ color: "#fff" }}>All Time Reward Points</p>
              </div>
              <div className="p-4 flex flex-col justify-center items-center">
                <p className="font-bold text-4xl" style={{ color: "#fff", textShadow: "0 1px 0 #fff8" }}>{formatNumber(10)}</p>
                <p className="text-lg sm:text-xl text-white/90" style={{ color: "#fff" }}>Training Sessions Last 30 Days</p>
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
      {/* Chalkboard ledge */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20"
        style={{
          width: "80%",
          height: "36px",
          background: "linear-gradient(90deg, #b08d57 0%, #e2c290 100%)",
          borderRadius: "0 0 18px 18px",
          boxShadow: "0 6px 16px 0 #0007, 0 2px 0 #fff5 inset",
          borderTop: "4px solid #a67c52",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: "32px"
        }}
        aria-hidden="true"
      >
        {/* Optional: Chalk pieces */}
        <div style={{
          width: "32px",
          height: "12px",
          background: "#fff",
          borderRadius: "4px",
          marginLeft: "8px",
          boxShadow: "0 1px 4px #bbb, 0 0 0 1px #eee"
        }} />
        <div style={{
          width: "18px",
          height: "8px",
          background: "#f5f5f5",
          borderRadius: "3px",
          marginLeft: "6px",
          boxShadow: "0 1px 2px #bbb"
        }} />
      </div>
      {/* Chalkboard font import */}
      <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Schoolbell&display=swap" rel="stylesheet" />
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