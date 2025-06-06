"use client"

import { useEffect, useState } from "react"
import { Clock, Timer, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import api from "@/utils/axios";

const StatItem = ({ title, value, subValue, icon: Icon, trend }) => (
  <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-gray-600">{title}</h4>
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {subValue && (
        <span className="text-sm text-gray-500 mb-1">{subValue}</span>
      )}
      {trend && (
        <span className={`flex items-center text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
)

export default function PerformanceStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/user/performance')
        if (data.success) {
          setStats(data)
        } else {
          throw new Error(data.error || 'Failed to fetch performance stats')
        }
      } catch (error) {
        console.error('Failed to fetch performance stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div>Loading performance stats...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quiz Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatItem
                  title="Average Score"
                  value={`${stats?.averageScore || 0}%`}
                  trend={stats?.scoreTrend}
                />
                <StatItem
                  title="Best Category"
                  value={stats?.bestCategory?.name || 'N/A'}
                  subValue={`${stats?.bestCategory?.score || 0}%`}
                />
                <StatItem
                  title="Areas for Improvement"
                  value={stats?.weakestCategory?.name || 'N/A'}
                  subValue={`${stats?.weakestCategory?.score || 0}%`}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Learning Habits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatItem
                  title="Most Active Time"
                  value={stats?.mostActiveTime || 'N/A'}
                  icon={Clock}
                />
                <StatItem
                  title="Average Session"
                  value={`${stats?.avgSessionTime || 0} mins`}
                  icon={Timer}
                />
                <StatItem
                  title="Weekly Activity"
                  value={`${stats?.weeklyActivity || 0} days`}
                  icon={Calendar}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Category Progress</h3>
              <div className="space-y-4">
                {stats?.categoryProgress?.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span>{category.progress}%</span>
                    </div>
                    <Progress value={category.progress} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 