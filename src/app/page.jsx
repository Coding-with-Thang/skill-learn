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
    <div className="flex flex-col items-center justify-items-center min-h-[80dvh]">
      <HeroBanner />
      <SignedIn>
        <UserBadge />
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
