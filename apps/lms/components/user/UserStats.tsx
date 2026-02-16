"use client"

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card"
import { Button } from "@skill-learn/ui/components/button"
import { Progress } from "@skill-learn/ui/components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@skill-learn/ui/components/table"
import { SCORE_THRESHOLDS } from "@/config/constants"
import {
  Clock,
  Flame,
  GraduationCap,
  FileQuestion,
  Download,
  Calendar,
  School,
  BookOpen
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import api from "@skill-learn/lib/utils/axios"
import { handleErrorWithNotification } from "@skill-learn/lib/utils/notifications"

export default function UserStats({ user }: { user?: unknown } = {}) {
  const t = useTranslations("stats")
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/user/stats')
        const statsData = response.data?.data || response.data
        setStats(statsData)
      } catch (error) {
        handleErrorWithNotification(error, t("failedToLoadStats"))
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  type CategoryStat = { categoryId: string; [key: string]: unknown };
  type ActivityItem = { date?: string | number | Date; [key: string]: unknown };
  const fallback = {
    totalAttempts: 0,
    totalCompleted: 0,
    recentAttemptDate: null as string | null,
    longestStreak: 0,
    categoryStats: [] as CategoryStat[],
    recentActivity: [] as ActivityItem[]
  };
  const {
    totalAttempts = 0,
    totalCompleted = 0,
    recentAttemptDate = null,
    longestStreak = 0,
    categoryStats = [],
    recentActivity = []
  } = (stats as typeof fallback | null) ?? fallback

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Overview Section */}
      <OverviewHeader t={t} />

      {/* 2. Stat Cards (Top Row) */}
      <StatsGrid
        recentAttemptDate={recentAttemptDate}
        longestStreak={longestStreak}
        totalCompleted={totalCompleted}
        totalAttempts={totalAttempts}
        t={t}
      />

      {/* 3. Course Performance Section (Using Category Data) */}
      {categoryStats.length > 0 && (
        <Section title={t("coursePerformance")} icon={School}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryStats.map((cat) => (
              <CourseCard key={cat.categoryId} category={cat} t={t} />
            ))}
          </div>
        </Section>
      )}

      {/* 4. Recent Quiz Performance (Table) */}
      {recentActivity.length > 0 && (
        <Section title={t("recentQuizPerformance")} icon={FileQuestion}>
          <Card className="border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold px-4 py-3">{t("quiz")}</TableHead>
                  <TableHead className="font-semibold px-4 py-3">{t("category")}</TableHead>
                  <TableHead className="font-semibold px-4 py-3">{t("type")}</TableHead>
                  <TableHead className="font-semibold text-right px-4 py-3">{t("points")}</TableHead>
                  <TableHead className="font-semibold text-right px-4 py-3">{t("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium px-4 py-3">{activity.quizTitle}</TableCell>
                    <TableCell className="text-muted-foreground px-4 py-3">{activity.categoryName}</TableCell>
                    <TableCell className="text-muted-foreground px-4 py-3">{activity.type}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600 dark:text-green-400 px-4 py-3">
                      +{activity.points}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground px-4 py-3">
                      {activity.date != null ? format(new Date(activity.date), "MMM d, yyyy") : "—"}
                      <span className="block text-xs">
                        {activity.date != null ? formatDistanceToNow(new Date(activity.date), { addSuffix: true }) : ""}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Section>
      )}

      {/* 5. Category Performance Section */}
      <CategoryPerformanceCard categoryStats={categoryStats} t={t} />
    </div>
  )
}

function OverviewHeader({ t }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("overview")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("overviewDesc")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="bg-background">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {t("last30Days")}
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
          <Download className="mr-2 h-4 w-4" />
          {t("exportReport")}
        </Button>
      </div>
    </div>
  )
}

function StatsGrid({ recentAttemptDate, longestStreak, totalCompleted, totalAttempts, t }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={Clock}
        iconColor="text-blue-600 dark:text-blue-400"
        bgColor="bg-blue-50 dark:bg-blue-900/20"
        title={t("lastActivity")}
        value={recentAttemptDate
          ? formatDistanceToNow(new Date(recentAttemptDate), { addSuffix: true }).replace("about ", "")
          : t("noActivity")}
        subtext="User Management"
      />
      <StatCard
        icon={Flame}
        iconColor="text-orange-600 dark:text-orange-400"
        bgColor="bg-orange-50 dark:bg-orange-900/20"
        title={t("longestStreak")}
        value={longestStreak.toString()}
        unit={t("days")}
      >
        <div className="h-1 w-full bg-orange-100 dark:bg-orange-900/20 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-orange-500 w-[70%] rounded-full opacity-50" />
        </div>
      </StatCard>
      <StatCard
        icon={GraduationCap}
        iconColor="text-green-600 dark:text-green-400"
        bgColor="bg-green-50 dark:bg-green-900/20"
        title={t("totalCoursesCompleted")}
        value={totalCompleted.toString()} // Using totalCompleted categories/quizzes as proxy
        unit={t("allTime")}
      />
      <StatCard
        icon={FileQuestion}
        iconColor="text-purple-600 dark:text-purple-400"
        bgColor="bg-purple-50 dark:bg-purple-900/20"
        title={t("totalQuizzesAttempted")}
        value={totalAttempts.toString()}
      >
        <div className="flex items-baseline gap-2 mt-1">
          {/* Placeholder for weekly delta if available in future */}
        </div>
      </StatCard>
    </div>
  )
}

function StatCard({ icon: Icon, iconColor, bgColor, title, value, unit, subtext, children }: { icon: React.ComponentType<{ className?: string }>; iconColor?: string; bgColor?: string; title: string; value: string | number; unit?: string; subtext?: string; children?: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 ${bgColor} rounded-xl`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">
            {value} {unit && <span className="text-sm font-normal text-muted-foreground">{unit}</span>}
          </h3>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function CourseCard({ category, t }) {
  // Using simplified logic as course progress != category stats usually, but this is the data we have.
  const status = category.completed > 0 ? t("completed") : t("inProgress");
  const statusColor = category.completed > 0
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  const progressColor = category.completed > 0 ? "bg-green-500" : "bg-blue-500";

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-secondary/50 rounded-lg group-hover:bg-primary/10 transition-colors">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
            {status}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("categoryAnalysis")}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-2xl">{category.averageScore.toFixed(0)}%</span>
            <span className="text-muted-foreground">{t("avgScore")}</span>
          </div>
          <Progress value={category.averageScore} className="h-2" indicatorClassName={progressColor} />
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryPerformanceCard({ categoryStats, t }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-bold">{t("categoryPerformance")}</CardTitle>
        </div>
        <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto font-medium">
          {t("viewAllCategories")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categoryStats.length > 0 ? (
            categoryStats.map((category) => (
              <div key={category.name} className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {category.attempts} {t("attempts")}
                  </span>
                </div>
                <Progress
                  value={category.averageScore || 0}
                  className="h-2.5 bg-secondary"
                  indicatorClassName={`${(category.averageScore || 0) >= SCORE_THRESHOLDS.GOOD ? "bg-green-500" :
                    (category.averageScore || 0) >= SCORE_THRESHOLDS.WARNING ? "bg-yellow-500" : "bg-red-500"
                    }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("average")}: {(category.averageScore || 0).toFixed(1)}%</span>
                  <span>{t("best")}: {category.bestScore || 0}%</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t("noCategoryData")}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
