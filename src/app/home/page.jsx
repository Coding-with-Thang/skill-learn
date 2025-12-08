"use client"

import { SignedIn, useUser } from '@clerk/nextjs'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from "@/components/ui/loading"

// New Widgets
import WelcomeBanner from "@/components/features/user/WelcomeBanner";
import LeaderboardWidget from "@/components/features/user/LeaderboardWidget";
import AchievementsWidget from "@/components/features/user/AchievementsWidget";
import DailyActivitiesWidget from "@/components/features/user/DailyActivitiesWidget";
import TopicProgressWidget from "@/components/features/user/TopicProgressWidget";

export default function HomePage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // Client-side redirect fallback
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return <LoadingPage />;
  }

  return (
    <SignedIn>
      <div className="flex flex-col gap-8 pb-8 animate-fade-in-up">
        <WelcomeBanner />

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Daily Activities - 8 cols */}
          <div className="lg:col-span-7 xl:col-span-8">
            <DailyActivitiesWidget />
          </div>
          {/* Achievements - 4 cols */}
          <div className="lg:col-span-5 xl:col-span-4">
            <AchievementsWidget />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Leaderboard - 8 cols */}
          <div className="lg:col-span-7 xl:col-span-8">
            <LeaderboardWidget />
          </div>
          {/* Topic Progress - 4 cols */}
          <div className="lg:col-span-5 xl:col-span-4">
            <TopicProgressWidget />
          </div>
        </div>
      </div>
    </SignedIn>
  );
}
