import Link from "next/link";

import DailyActivities from "./components/DailyActivities";
import MoreTraining from "./components/MoreTraining";
import HeroBanner from "./components/HeroBanner";
import PerformanceLanding from "./components/PerformanceLanding";
import LeaderboardLanding from "./components/LeaderboardLanding";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen">
      <HeroBanner />
      <DailyActivities />
      <MoreTraining />
      <PerformanceLanding />
      <LeaderboardLanding />
    </div>
  );
}
