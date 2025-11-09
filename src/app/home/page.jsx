"use client"

import { SignedIn, useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DailyActivities from "../components/User/DailyActivities";
import MoreTraining from "../components/User/Training";
import PerformanceLanding from "../components/User/PerformanceLanding";
import LeaderboardLanding from "../components/User/LeaderboardLanding";
import UserBadge from '../components/User/UserBadge';
import { LoadingPage } from "@/components/ui/loading"
import { LoadingHeader } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"

export default function HomePage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [error, setError] = useState(null);

  // Client-side redirect fallback (middleware handles server-side)
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <>
        <LoadingHeader />
        <LoadingPage />
      </>
    );
  }

  // Show loading while redirecting
  if (!user) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorCard
          error={error}
          message="Failed to load homepage"
          reset={() => setError(null)}
        />
      </main>
    );
  }

  // Wrap each section in error boundaries
  const renderSection = (Component, props = {}) => {
    try {
      return <Component {...props} />;
    } catch (err) {
      console.error(`Failed to render ${Component.name}:`, err);
      return (
        <ErrorCard
          error={err}
          message={`Failed to load ${Component.name}`}
        />
      );
    }
  };

  return (
    <SignedIn>
      <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 min-h-[80dvh] flex flex-col gap-8">
        {/* Hero Section for logged-in users */}
        <section className="w-full mt-8 mb-6 p-8 rounded-3xl shadow-2xl bg-white/90 flex flex-col md:flex-row items-center gap-8 border border-green-200">
          <div className="flex-1 flex flex-col items-center md:items-start">
            {renderSection(UserBadge)}
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 gap-6">
              {renderSection(DailyActivities)}
              {renderSection(MoreTraining)}
            </div>
          </div>
        </section>

        {/* Dashboard Widgets */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-100">
            {renderSection(PerformanceLanding)}
          </div>
          <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-100">
            {renderSection(LeaderboardLanding)}
          </div>
        </section>
      </main>
    </SignedIn>
  );
}

