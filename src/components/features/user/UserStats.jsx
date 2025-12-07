"use client"

import { useState, useEffect } from 'react'
import { InteractiveCard, InteractiveCardContent } from "@/components/ui/interactive-card"
import { AnimatedProgress } from "@/components/ui/animated-progress"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { PencilLine, Crosshair, ListChecks, Trophy, TrendingUp, Clock, Target } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatTime } from '@/utils/formatTime'
import api from '@/utils/axios'

export default function UserStats({ user }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/user/stats')
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const {
    totalAttempts = 0,
    totalCompleted = 0,
    averageScore = 0,
    bestScore = 0,
    totalPoints = 0,
    recentAttemptDate = null,
    categoryStats = []
  } = stats || {}

  return (
    <div className="space-y-6">
      <div className="mt-4">
        <h1 className="font-bold text-2xl text-foreground">Overview</h1>
        <p className="text-muted-foreground">
          A summary of your recent activity and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HoverCard>
          <HoverCardTrigger asChild>
            <InteractiveCard className="py-4 px-4 flex gap-2 border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-normal cursor-pointer">
              <div className="text-2xl text-primary group-hover:scale-110 transition-transform duration-200">
                <PencilLine />
              </div>
              <div>
                <p className="text-lg font-semibold">Most Recent Attempt</p>
                <p className="font-bold text-2xl">{formatTime(recentAttemptDate)}</p>
              </div>
            </InteractiveCard>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Recent Activity</h4>
              <p className="text-sm text-muted-foreground">
                Your last quiz attempt was {formatTime(recentAttemptDate)}. Keep up the great work!
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <InteractiveCard className="py-4 px-4 flex gap-2 border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-normal cursor-pointer">
              <div className="text-2xl text-primary group-hover:scale-110 transition-transform duration-200">
                <Crosshair />
              </div>
              <div>
                <p className="font-bold">Total Quizzes Attempted</p>
                <p className="mt-2 font-bold text-3xl">{totalAttempts}</p>
              </div>
            </InteractiveCard>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Quiz Attempts</h4>
              <p className="text-sm text-muted-foreground">
                You&apos;ve attempted {totalAttempts} quizzes total. {totalCompleted} were completed successfully.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <InteractiveCard className="py-4 px-4 flex gap-2 border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-normal cursor-pointer">
              <div className="text-2xl text-primary group-hover:scale-110 transition-transform duration-200">
                <ListChecks />
              </div>
              <div>
                <p className="font-bold">Total Quizzes Completed</p>
                <p className="mt-2 font-bold text-3xl">{totalCompleted}</p>
              </div>
            </InteractiveCard>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Completed Quizzes</h4>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully completed {totalCompleted} quizzes with an average score of {averageScore.toFixed(1)}%.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Performance Overview */}
      <InteractiveCard className="border border-border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
              <Trophy className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-2xl font-bold text-success">{bestScore}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-info/10 border border-info/20">
              <TrendingUp className="h-8 w-8 text-info mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-info">{averageScore.toFixed(1)}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
              <Clock className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold text-warning">{totalPoints.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-primary">
                {totalAttempts > 0 ? ((totalCompleted / totalAttempts) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </InteractiveCard>

      {/* Category Performance */}
      <InteractiveCard className="border border-border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Category Performance</h3>
          <div className="space-y-4">
            {categoryStats.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.attempts} attempts
                  </span>
                </div>
                <AnimatedProgress
                  value={category.averageScore}
                  max={100}
                  variant={category.averageScore >= 80 ? "success" : category.averageScore >= 60 ? "warning" : "error"}
                  className="h-2"
                  showLabel={false}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Average: {category.averageScore.toFixed(1)}%</span>
                  <span>Best: {category.bestScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </InteractiveCard>
    </div>
  )
}
