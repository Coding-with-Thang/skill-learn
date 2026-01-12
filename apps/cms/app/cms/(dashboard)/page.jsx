'use client'

import { useState, useEffect } from 'react'
import HeroStatsCard from '@/components/cms/dashboard/HeroStatsCard'
import RevenueChart from '@/components/cms/dashboard/RevenueChart'
import TenantActivityTable from '@/components/cms/dashboard/TenantActivityTable'
import SystemHealthPanel from '@/components/cms/dashboard/SystemHealthPanel'
import RecentAlertsPanel from '@/components/cms/dashboard/RecentAlertsPanel'
import SubscriptionDistribution from '@/components/cms/dashboard/SubscriptionDistribution'
import QuickActions from '@/components/cms/dashboard/QuickActions'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    heroStats: [],
    revenueData: [],
    systemStatus: [],
    resourceUsage: [],
    recentAlerts: [],
    subscriptionDistribution: [],
    recentTenants: [],
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/dashboard/stats')

        if (response.status === 401 || response.status === 403) {
          const data = await response.json()
          setError(data.error || 'Unauthorized - Super admin access required')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <main className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-6 w-full">
        <div className="rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 p-4">
          {error}
        </div>
      </main>
    )
  }

  return (
    <main className="p-4 lg:p-6 w-full">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 lg:mb-8"
        >
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </motion.div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {dashboardData.heroStats.map((stat, index) => (
            <HeroStatsCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Revenue Chart */}
        {dashboardData.revenueData.length > 0 && (
          <div className="mb-6">
            <RevenueChart data={dashboardData.revenueData} />
          </div>
        )}

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tenant Activity Table - 2 columns */}
          <div className="lg:col-span-2">
            <TenantActivityTable tenants={dashboardData.recentTenants || []} />
          </div>

          {/* Right Column - 1 column */}
          <div className="space-y-6">
            {dashboardData.systemStatus.length > 0 && (
              <SystemHealthPanel
                systemStatus={dashboardData.systemStatus}
                resourceUsage={dashboardData.resourceUsage}
              />
            )}
            {dashboardData.recentAlerts.length > 0 && (
              <RecentAlertsPanel alerts={dashboardData.recentAlerts} />
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboardData.subscriptionDistribution.length > 0 && (
            <SubscriptionDistribution data={dashboardData.subscriptionDistribution} />
          )}
          <QuickActions />
        </div>
      </main>
  )
}
