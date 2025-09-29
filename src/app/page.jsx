"use client"

import { SignedIn, SignedOut } from "@clerk/nextjs"
import { InteractiveCard, InteractiveCardContent } from "@/components/ui/interactive-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import UserBadge from "./components/User/UserBadge"
import HeroBanner from "./components/User/HeroBanner"
import Features from "./components/User/Features"
import Testimonials from "./components/User/Testimonials"
import Training from "./components/User/Training"
import PerformanceLanding from "./components/User/PerformanceLanding"
import LeaderboardLanding from "./components/User/LeaderboardLanding"
import { Play, Trophy, Target, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const renderSection = (Component) => {
    return (
      <div className="w-full">
        <Component />
      </div>
    )
  }

  return (
    <>
      <SignedIn key="signed-in">
        {/* Hero Section for logged-in users */}
        <section className="w-full mt-8 mb-6 p-8 rounded-3xl shadow-2xl bg-card/90 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 flex flex-col items-center md:items-start">
            {renderSection(UserBadge)}
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 gap-6">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <InteractiveCard className="p-6 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Play className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Start Learning</h3>
                        <p className="text-sm text-muted-foreground">Begin your training journey</p>
                      </div>
                    </div>
                  </InteractiveCard>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Ready to Learn?</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose from our wide range of training categories and start improving your skills today.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <InteractiveCard className="p-6 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-success/10 text-success">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Track Progress</h3>
                        <p className="text-sm text-muted-foreground">Monitor your achievements</p>
                      </div>
                    </div>
                  </InteractiveCard>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Your Achievements</h4>
                    <p className="text-sm text-muted-foreground">
                      View your performance stats, earned points, and completed quizzes.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <InteractiveCard className="p-6 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-warning/10 text-warning">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Set Goals</h3>
                        <p className="text-sm text-muted-foreground">Define your learning objectives</p>
                      </div>
                    </div>
                  </InteractiveCard>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Learning Goals</h4>
                    <p className="text-sm text-muted-foreground">
                      Set personal targets and track your progress towards achieving them.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </section>

        {/* Dashboard Widgets */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <InteractiveCard className="bg-card/80 rounded-2xl shadow-lg p-6 border border-border">
            {renderSection(PerformanceLanding)}
          </InteractiveCard>
          <InteractiveCard className="bg-card/80 rounded-2xl shadow-lg p-6 border border-border">
            {renderSection(LeaderboardLanding)}
          </InteractiveCard>
        </section>

        {/* Quick Actions */}
        <section className="w-full mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EnhancedButton
              variant="outline"
              size="lg"
              className="h-24 flex flex-col gap-2"
              onClick={() => window.location.href = '/training'}
            >
              <Play className="h-8 w-8" />
              <span>Start Training</span>
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="lg"
              className="h-24 flex flex-col gap-2"
              onClick={() => window.location.href = '/stats'}
            >
              <TrendingUp className="h-8 w-8" />
              <span>View Stats</span>
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="lg"
              className="h-24 flex flex-col gap-2"
              onClick={() => window.location.href = '/rewards'}
            >
              <Trophy className="h-8 w-8" />
              <span>Redeem Rewards</span>
            </EnhancedButton>
          </div>
        </section>

        {/* Training Section */}
        <section className="w-full mb-12">
          {renderSection(Training)}
        </section>

        {/* Features Section */}
        <section className="w-full mb-12">
          {renderSection(Features)}
        </section>

        {/* Testimonials Section */}
        <section className="w-full mb-12">
          {renderSection(Testimonials)}
        </section>
      </SignedIn>

      <SignedOut key="signed-out">
        {/* Hero Section for non-logged-in users */}
        <section className="w-full">
          {renderSection(HeroBanner)}
        </section>

        {/* Features Section */}
        <section className="w-full">
          {renderSection(Features)}
        </section>

        {/* Testimonials Section */}
        <section className="w-full">
          {renderSection(Testimonials)}
        </section>
      </SignedOut>
    </>
  )
}
