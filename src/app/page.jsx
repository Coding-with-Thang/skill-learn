"use client"

import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import { useState } from 'react';
import DailyActivities from "./components/User/DailyActivities";
import MoreTraining from "./components/User/Training";
import HeroBanner from "./components/User/HeroBanner";
import PerformanceLanding from "./components/User/PerformanceLanding";
import LeaderboardLanding from "./components/User/LeaderboardLanding";
import Features from './components/User/Features';
import HowItWorks from './components/User/HowItWorks';
import Testimonials from './components/User/Testimonials';
import UserBadge from './components/User/UserBadge';
import { LoadingPage } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"

export default function HomePage() {
  const { isLoaded } = useUser();
  const [error, setError] = useState(null);

  if (!isLoaded) {
    return (
      <>
        <LoadingPage />
      </>
    );
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
    <>
      <SignedOut>
        <section className="w-screen mb-4 overflow-x-hidden">
          {renderSection(HeroBanner)}
        </section>
      </SignedOut>
      <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 min-h-[80dvh] flex flex-col gap-8">
        <SignedIn>
          {/* Hero Section for logged-in users */}
          <section className="w-full mt-8 mb-6 p-8 rounded-3xl shadow-2xl bg-[var(--card)]/90 flex flex-col md:flex-row items-center gap-8">
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
            <div className="bg-[var(--card)]/80 rounded-2xl shadow-lg p-6 border border-[var(--border)]">
              {renderSection(PerformanceLanding)}
            </div>
            <div className="bg-[var(--card)]/80 rounded-2xl shadow-lg p-6 border border-[var(--border)]">
              {renderSection(LeaderboardLanding)}
            </div>
          </section>
        </SignedIn>
        <SignedOut>
          <section className="w-full max-w-3xl mx-auto grid grid-cols-1 gap-6 px-2 sm:px-4 md:px-8">
            {renderSection(Features)}
            {renderSection(HowItWorks)}
            {renderSection(Testimonials)}
          </section>
        </SignedOut>
      </main>
    </>
  );
}
