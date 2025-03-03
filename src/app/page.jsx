"use client"

import { SignedIn, SignedOut } from '@clerk/nextjs'
import DailyActivities from "./components/DailyActivities";
import MoreTraining from "./components/MoreTraining";
import HeroBanner from "./components/HeroBanner";
import PerformanceLanding from "./components/PerformanceLanding";
import LeaderboardLanding from "./components/LeaderboardLanding";
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-[80dvh]">
      <HeroBanner />
      <SignedIn>
        <DailyActivities />
        <MoreTraining />
        <PerformanceLanding />
        <LeaderboardLanding />
      </SignedIn>

      <SignedOut>
        <Features />
        <HowItWorks />
        {/* <Testimonials /> */}
      </SignedOut>
    </div>
  );
}
