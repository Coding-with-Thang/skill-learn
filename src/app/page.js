import Link from "next/link";

import DailyActivities from "./components/DailyActivities";
import MoreTraining from "./components/MoreTraining";
import HeroBanner from "./components/HeroBanner";
import PerformanceLanding from "./components/PerformanceLanding";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen">
      <HeroBanner />
      <DailyActivities />
      <MoreTraining />
      <PerformanceLanding />
      <Link href="/games" className="text-center text-5xl underline my-9">
        Play A Game
      </Link>
    </div>
  );
}
