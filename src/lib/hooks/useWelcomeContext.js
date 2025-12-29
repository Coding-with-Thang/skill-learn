"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { usePointsStore } from "@/app/store/pointsStore";
import api from "@/utils/axios";

/**
 * Custom hook to aggregate all user context data for welcome banner
 * @returns {Object} - User context including points, streak, leaderboard, quiz data, etc.
 */
export function useWelcomeContext() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { role } = useUserRole();
  const { points, lifetimePoints, streak, dailyStatus, fetchUserData } = usePointsStore();
  
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [lastQuizScore, setLastQuizScore] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [lastActivityDate, setLastActivityDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clerkLoaded || !user) {
      setIsLoading(false);
      return;
    }

    const loadWelcomeContext = async () => {
      setIsLoading(true);

      try {
        // Fetch points and streak data
        await fetchUserData();

        // Check if first-time user (using localStorage)
        const hasVisitedKey = `hasVisited_${user.id}`;
        const hasVisited = localStorage.getItem(hasVisitedKey);
        if (!hasVisited) {
          setIsFirstTime(true);
          localStorage.setItem(hasVisitedKey, 'true');
        } else {
          setIsFirstTime(false);
        }

        // Get last activity date from localStorage
        const lastActivityKey = `lastActivity_${user.id}`;
        const lastActivity = localStorage.getItem(lastActivityKey);
        setLastActivityDate(lastActivity);
        
        // Update last activity to now
        localStorage.setItem(lastActivityKey, new Date().toISOString());

        // Track visit count for greeting rotation
        const visitCountKey = `visitCount_${user.id}`;
        const currentVisitCount = parseInt(localStorage.getItem(visitCountKey) || '0', 10);
        const newVisitCount = currentVisitCount + 1;
        localStorage.setItem(visitCountKey, newVisitCount.toString());

        // Fetch leaderboard position (parallel requests)
        const [leaderboardRes, quizStatsRes] = await Promise.allSettled([
          api.get("/leaderboard/points"),
          api.get("/user/quiz/stats"),
        ]);

        // Process leaderboard data
        if (leaderboardRes.status === "fulfilled" && leaderboardRes.value?.data?.leaderboard) {
          const userPosition = leaderboardRes.value.data.leaderboard.findIndex(
            (entry) => entry.clerkId === user.id
          );
          if (userPosition !== -1) {
            setLeaderboardPosition(userPosition + 1);
          }
        }

        // Process quiz stats
        if (quizStatsRes.status === "fulfilled" && quizStatsRes.value?.data) {
          const quizData = quizStatsRes.value.data;
          // Get the most recent quiz score if available
          if (quizData.recentQuizzes && quizData.recentQuizzes.length > 0) {
            const mostRecent = quizData.recentQuizzes[0];
            setLastQuizScore(mostRecent.score);
          } else if (quizData.averageScore) {
            setLastQuizScore(quizData.averageScore);
          }
        }
      } catch (error) {
        console.error("Error loading welcome context:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWelcomeContext();
  }, [clerkLoaded, user, fetchUserData]);

  // Build context object
  const context = {
    // User info
    firstName: user?.firstName || user?.username || "there",
    role,
    
    // Points and streak
    points: points || lifetimePoints || 0,
    lifetimePoints: lifetimePoints || 0,
    streak: streak?.current || 0,
    streakAtRisk: streak?.atRisk || false,
    longestStreak: streak?.longest || 0,
    
    // Leaderboard
    leaderboardPosition,
    
    // Quiz performance
    lastQuizScore,
    
    // Activity tracking
    isFirstTime,
    lastActivityDate,
    visitCount: user ? parseInt(localStorage.getItem(`visitCount_${user.id}`) || '0', 10) : 0,
    
    // Daily status
    todaysPoints: dailyStatus?.todaysPoints || 0,
    canEarnPoints: dailyStatus?.canEarnPoints ?? true,
    
    // Loading state
    isLoading,
  };

  return context;
}

export default useWelcomeContext;
