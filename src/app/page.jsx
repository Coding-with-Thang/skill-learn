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
import { LoadingHeader } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"

export default function HomePage() {
  const { isLoaded } = useUser();
  const [error, setError] = useState(null);

  if (!isLoaded) {
    return (
      <>
        <LoadingHeader />
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
    <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-6 min-h-[80dvh] flex flex-col gap-8">
      <SignedIn>
        <section className="mb-4 w-full">
          {renderSection(UserBadge)}
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {renderSection(DailyActivities)}
          {renderSection(MoreTraining)}
          {renderSection(PerformanceLanding)}
          {renderSection(LeaderboardLanding)}
        </section>
      </SignedIn>
      <SignedOut>
        <section className="mb-4 w-full">
          {renderSection(HeroBanner)}
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {renderSection(Features)}
          {renderSection(HowItWorks)}
          {renderSection(Testimonials)}
        </section>
      </SignedOut>
    </main>
  );
}
