"use client";

import { useState, useEffect, useMemo } from "react";
import { useWelcomeContext } from "@/lib/hooks/useWelcomeContext";
import { generateGreeting } from "@/lib/utils/greetingGenerator";
import { Sparkles, TrendingUp, Award, Flame } from "lucide-react";

export default function WelcomeBanner() {
  const context = useWelcomeContext();
  const [showContent, setShowContent] = useState(false);

  // Generate greeting when context changes (memoized to prevent infinite loops)
  const greeting = useMemo(() => {
    if (context.isLoading) {
      return { text: "", subtext: "" };
    }
    return generateGreeting(context);
  }, [context]);

  // Trigger animation when greeting changes
  useEffect(() => {
    if (!context.isLoading && greeting.text) {
      setShowContent(false);
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    }
  }, [context.isLoading, greeting.text]);

  // Determine visual theme based on context
  const getTheme = () => {
    if (context.isFirstTime) {
      return {
        gradient: "from-purple-600 via-pink-500 to-blue-500",
        icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />,
        accentColor: "bg-purple-300/20",
      };
    }

    if (context.streak >= 10) {
      return {
        gradient: "from-orange-500 via-red-500 to-pink-500",
        icon: <Flame className="w-8 h-8 md:w-10 md:h-10 animate-bounce" />,
        accentColor: "bg-orange-300/20",
      };
    }

    if (context.leaderboardPosition && context.leaderboardPosition <= 10) {
      return {
        gradient: "from-yellow-500 via-amber-500 to-orange-500",
        icon: <Award className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />,
        accentColor: "bg-yellow-300/20",
      };
    }

    if (context.points > 5000) {
      return {
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
        icon: <TrendingUp className="w-8 h-8 md:w-10 md:h-10 animate-pulse" />,
        accentColor: "bg-emerald-300/20",
      };
    }

    // Default theme
    return {
      gradient: "from-blue-600 to-blue-400",
      icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10" />,
      accentColor: "bg-blue-300/20",
    };
  };

  const theme = getTheme();

  // Loading state
  if (context.isLoading) {
    return (
      <div className="w-full relative overflow-hidden rounded-3xl bg-linear-to-r from-gray-300 to-gray-200 p-8 md:p-12 text-white shadow-lg mb-8 animate-pulse">
        <div className="relative z-10 max-w-2xl">
          <div className="h-10 bg-white/20 rounded-lg mb-4 w-3/4"></div>
          <div className="h-6 bg-white/20 rounded-lg w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full relative overflow-hidden rounded-3xl bg-linear-to-r ${theme.gradient} p-8 md:p-12 text-white shadow-lg mb-8 transition-all duration-500`}>
      {/* Background Decorative Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className={`absolute bottom-0 right-20 w-48 h-48 ${theme.accentColor} rounded-full blur-xl`}></div>
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 blur-xl"></div>

      {/* Floating Icon */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 text-white/80">
        {theme.icon}
      </div>

      <div className="relative z-10 max-w-3xl">
        {/* Main Greeting */}
        <h1
          className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {greeting.text}
        </h1>

        {/* Subtext */}
        <p
          className={`text-white/90 text-lg mb-6 transition-all duration-700 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {greeting.subtext}
        </p>

        {/* Stats Row */}
        <div
          className={`flex flex-wrap gap-4 md:gap-6 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {/* Streak Badge */}
          {context.streak > 0 && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="font-semibold text-sm md:text-base">
                {context.streak} day streak
              </span>
            </div>
          )}

          {/* Points Badge */}
          {context.points > 0 && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
              <span className="font-semibold text-sm md:text-base">
                {context.points.toLocaleString()} points
              </span>
            </div>
          )}

          {/* Leaderboard Badge */}
          {context.leaderboardPosition && context.leaderboardPosition <= 100 && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold text-sm md:text-base">
                Rank #{context.leaderboardPosition}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
