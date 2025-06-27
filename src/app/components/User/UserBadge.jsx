"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { usePointsStore } from "@/app/store/pointsStore"
import formatNumber from "@/utils/formatNumbers";
import { LoadingUserBadge } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"

export default function UserBadge() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { points, lifetimePoints, isLoading, fetchUserData } = usePointsStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!isSignedIn || !isLoaded) return;

      try {
        await fetchUserData();
      } catch (err) {
        console.error("Failed to load user data:", err);
        if (isMounted) {
          setError(err);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [isSignedIn, isLoaded, fetchUserData]);

  if (!isLoaded) {
    return <LoadingUserBadge />
  }

  if (!isSignedIn) {
    return null;
  }

  if (error) {
    return (
      <ErrorCard
        error={error}
        message="Failed to load user data"
        reset={() => {
          setError(null);
          fetchUserData(true); // Force refresh on retry
        }}
      />
    );
  }

  return (
    <div
      className="relative min-h-[50rem] h-full w-full flex flex-col items-center justify-center overflow-hidden animate-fadeIn"
      aria-label="User Badge Section"
      style={{
        backgroundColor: "var(--background)",
        backgroundImage: "url('/chalkboard_texture.png'), radial-gradient(circle at 20% 20%, #2e4a21 60%, #1a2a13 100%)",
        backgroundBlendMode: "multiply",
        border: "8px solid var(--border)",
        borderRadius: "32px",
        boxShadow: "0 8px 32px 0 var(--card-shadow), 0 0 0 4px var(--ring)",
        outline: "2px dashed var(--ring)",
        outlineOffset: "8px",
      }}
    >
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
            color: "var(--foreground)",
            textShadow: "0 2px 0 var(--ring), 0 0 8px var(--ring)"
          }}
        >
          {user ? `Welcome, ${user.firstName}!` : "Welcome!"}
        </h2>
        {!isLoading ? (
          <div className="mt-10 px-4 sm:px-10 bg-white/5 backdrop-blur-md grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-xl shadow-xl ring-1 ring-white/10 w-full max-w-3xl transition-all border-2 border-white/30"
            style={{
              boxShadow: "0 2px 16px 0 var(--card-shadow), 0 0 0 2px var(--ring)",
              fontFamily: "'Permanent Marker', 'Schoolbell', cursive, sans-serif",
            }}
          >
            <div className="p-4 flex flex-col justify-center items-center">
              <p className="font-bold text-4xl" style={{ color: "var(--foreground)", textShadow: "0 1px 0 var(--ring)" }}>{formatNumber(points)}</p>
              <p className="text-lg sm:text-xl text-white/90" style={{ color: "var(--foreground)" }}>Current Reward Points</p>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <p className="font-bold text-4xl" style={{ color: "var(--foreground)", textShadow: "0 1px 0 var(--ring)" }}>{formatNumber(lifetimePoints)}</p>
              <p className="text-lg sm:text-xl text-white/90" style={{ color: "var(--foreground)" }}>All Time Reward Points</p>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <p className="font-bold text-4xl" style={{ color: "var(--foreground)", textShadow: "0 1px 0 var(--ring)" }}>{formatNumber(10)}</p>
              <p className="text-lg sm:text-xl text-white/90" style={{ color: "var(--foreground)" }}>Training Sessions Last 30 Days</p>
            </div>
          </div>
        ) : (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20"
        style={{
          width: "80%",
          height: "36px",
          background: "linear-gradient(90deg, #b08d57 0%, #e2c290 100%)",
          borderRadius: "0 0 18px 18px",
          boxShadow: "0 6px 16px 0 var(--card-shadow), 0 2px 0 var(--ring) inset",
          borderTop: "4px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: "32px"
        }}
        aria-hidden="true"
      >
        <div style={{
          width: "32px",
          height: "12px",
          background: "var(--card)",
          borderRadius: "4px",
          marginLeft: "8px",
          boxShadow: "0 1px 4px var(--border), 0 0 0 1px var(--ring)"
        }} />
        <div style={{
          width: "18px",
          height: "8px",
          background: "var(--muted)",
          borderRadius: "3px",
          marginLeft: "6px",
          boxShadow: "0 1px 2px var(--border)"
        }} />
      </div>
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
  );
}