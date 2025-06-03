"use client"

import { SignedIn, SignedOut } from '@clerk/nextjs'
import DailyActivities from "./components/User/DailyActivities";
import MoreTraining from "./components/User/Training";
import HeroBanner from "./components/User/HeroBanner";
import PerformanceLanding from "./components/User/PerformanceLanding";
import LeaderboardLanding from "./components/User/LeaderboardLanding";
import Features from './components/User/Features';
import HowItWorks from './components/User/HowItWorks';
import Testimonials from './components/User/Testimonials';
import UserBadge from './components/User/UserBadge';
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-[80dvh]">
      <SignedIn>
        <section className="mb-8">
          <UserBadge />
        </section>
        <section className="grid gap-8">
          <DailyActivities />
          <MoreTraining />
          <PerformanceLanding />
          <LeaderboardLanding />
        </section>
      </SignedIn>
      <SignedOut>
        <section className="mb-8">
          <HeroBanner />
        </section>
        <section className="grid gap-8">
          <Features />
          <HowItWorks />
          <Testimonials />
        </section>
      </SignedOut>
      {/* TODO: Add loading states, dark mode toggle, and improve accessibility */}
    </main>
  );
}
