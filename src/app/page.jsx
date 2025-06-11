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
  const { user, isLoaded } = useUser();
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
    <main className="container mx-auto px-4 py-8 min-h-[80dvh]">
      <SignedIn>
        <section className="mb-8">
          {renderSection(UserBadge)}
        </section>
        <section className="grid gap-8">
          {renderSection(DailyActivities)}
          {renderSection(MoreTraining)}
          {renderSection(PerformanceLanding)}
          {renderSection(LeaderboardLanding)}
        </section>
      </SignedIn>
      <SignedOut>
        <section className="mb-8">
          {renderSection(HeroBanner)}
        </section>
        <section className="grid gap-8">
          {renderSection(Features)}
          {renderSection(HowItWorks)}
          {renderSection(Testimonials)}
        </section>
      </SignedOut>
    </main>
  );
}
