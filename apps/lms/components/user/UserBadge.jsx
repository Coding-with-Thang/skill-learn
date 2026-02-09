"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Button } from "@skill-learn/ui/components/button";
import { Card, CardContent } from "@skill-learn/ui/components/card";
import { Loader2 } from "lucide-react";
import { usePointsStore } from "@skill-learn/lib/stores/pointsStore.js"
import formatNumber from "@/lib/utils/formatNumbers";
import { LoadingUserBadge } from "@skill-learn/ui/components/loading"
import { ErrorCard } from "@skill-learn/ui/components/error-boundary"

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
      className="relative min-h-[50rem] h-full w-full flex flex-col items-center justify-center overflow-hidden animate-fadeIn bg-gradient-to-br from-primary to-secondary border-8 border-border rounded-[32px] shadow-xl outline-dashed outline-2 outline-ring outline-offset-8"
      aria-label="User Badge Section"
    >
      <div className="absolute inset-0 pointer-events-none z-0 bg-[url('/chalkboard_texture.png')] bg-repeat opacity-15 mix-blend-screen" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center w-full">
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user ? `${user.firstName} ${user.lastName} profile image` : "User profile image"}
            width={160}
            height={160}
            className="rounded-full border-4 border-white/60 shadow-lg bg-white/10 object-cover mt-6"
            priority
          />
        ) : (
          <div
            className="rounded-full border-4 border-white/60 shadow-lg bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center mt-6"
            style={{ width: 160, height: 160 }}
          >
            <span className="text-6xl font-bold text-white drop-shadow-lg">
              {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
        <h2
          className="text-4xl font-bold my-6 drop-shadow-lg text-center text-primary font-marker"
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
              <p className="font-bold text-4xl text-primary drop-shadow-sm">{formatNumber(points)}</p>
              <p className="text-lg sm:text-xl text-muted-foreground">Current Reward Points</p>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <p className="font-bold text-4xl text-primary drop-shadow-sm">{formatNumber(lifetimePoints)}</p>
              <p className="text-lg sm:text-xl text-muted-foreground">All Time Reward Points</p>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <p className="font-bold text-4xl text-primary drop-shadow-sm">{formatNumber(10)}</p>
              <p className="text-lg sm:text-xl text-muted-foreground">Training Sessions Last 30 Days</p>
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
        className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20 w-4/5 h-9 bg-gradient-to-r from-yellow-600 to-yellow-300 rounded-b-[18px] shadow-lg border-t-4 border-border flex items-center justify-end pr-8"
        aria-hidden="true"
      >
        <div className="w-8 h-3 bg-card rounded ml-2 shadow" />
        <div className="w-4 h-2 bg-muted rounded ml-1.5 shadow" />
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
  );
}