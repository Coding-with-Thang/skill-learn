import DailyActivities from "./components/DailyActivities";
import MoreTraining from "./components/MoreTraining";
import HeroBanner from "./components/HeroBanner";
import PerformanceLanding from "./components/PerformanceLanding";
import LeaderboardLanding from "./components/LeaderboardLanding";
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
export default function Home() {
  const isSignedIn = true;
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen">
      <HeroBanner />
      {isSignedIn ?
        //Signed In Landing Page
        <>
          <DailyActivities />
          <MoreTraining />
          <PerformanceLanding />
          <LeaderboardLanding />
        </>
        :
        //Default Landing Page
        <>
          <Features />
          <HowItWorks />
          <Testimonials />
        </>
      }
    </div>
  );
}
