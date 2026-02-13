'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@skill-learn/ui/components/card"
import RevenueChart from '@/components/cms/dashboard/RevenueChart'
import SubscriptionDistribution from '@/components/cms/dashboard/SubscriptionDistribution'
import { ArrowUpRight, ArrowDownRight, Users, Zap, Clock, MousePointerClick, Loader2 } from 'lucide-react'
import api from "@skill-learn/lib/utils/axios"

// Mock Data
const revenueData = [
  { date: 'Jan', mrr: 105000, newRevenue: 15000, churned: 2000 },
  { date: 'Feb', mrr: 112000, newRevenue: 18000, churned: 1500 },
  { date: 'Mar', mrr: 124500, newRevenue: 22000, churned: 1800 },
  { date: 'Apr', mrr: 138000, newRevenue: 25000, churned: 2200 },
  { date: 'May', mrr: 145000, newRevenue: 12000, churned: 3000 },
  { date: 'Jun', mrr: 152000, newRevenue: 18000, churned: 2500 },
]

const engagementStats = [
  {
    title: 'Daily Active Users',
    value: '12,450',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Avg. Session Duration',
    value: '24m 12s',
    change: '+5.2%',
    trend: 'up',
    icon: Clock,
  },
  {
    title: 'Feature Usage',
    value: '85%',
    change: '-2.1%',
    trend: 'down',
    icon: Zap,
  },
  {
    title: 'Click Through Rate',
    value: '4.8%',
    change: '+0.5%',
    trend: 'up',
    icon: MousePointerClick,
  },
]

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscriptionData, setSubscriptionData] = useState([])

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/dashboard/stats')

        // Extract subscription distribution from API response
        const distribution = response.data?.subscriptionDistribution || []
        setSubscriptionData(distribution)
      } catch (err) {
        console.error('Error fetching subscription data:', err)
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(err.response?.data?.error || 'Unauthorized - Super admin access required')
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to load subscription data')
        }
        // Fallback to empty array on error
        setSubscriptionData([])
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [])

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your platform&apos;s performance and growth metrics.</p>
      </motion.div>

      {/* Engagement Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {engagementStats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.trend === 'up'

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className={isPositive ? "text-green-500" : "text-red-500"}>
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Subscription Distribution */}
        <div>
          {loading ? (
            <Card>
              <CardContent className="p-6 flex items-center justify-center min-h-[280px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4 text-sm">
                  {error}
                </div>
              </CardContent>
            </Card>
          ) : subscriptionData.length > 0 ? (
            <SubscriptionDistribution data={subscriptionData} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">No subscription data available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
