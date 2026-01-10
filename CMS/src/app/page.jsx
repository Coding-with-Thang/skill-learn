'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import HeroStatsCard from '@/components/dashboard/HeroStatsCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import TenantActivityTable from '@/components/dashboard/TenantActivityTable'
import SystemHealthPanel from '@/components/dashboard/SystemHealthPanel'
import RecentAlertsPanel from '@/components/dashboard/RecentAlertsPanel'
import SubscriptionDistribution from '@/components/dashboard/SubscriptionDistribution'
import QuickActions from '@/components/dashboard/QuickActions'
import {
  mockTenants,
  revenueData,
  systemStatus,
  resourceUsage,
  recentAlerts,
  subscriptionDistribution,
  heroStats
} from '@/lib/mockData'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <DashboardLayout>
      <main className="p-6 w-full">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </motion.div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {heroStats.map((stat, index) => (
            <HeroStatsCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="mb-6">
          <RevenueChart data={revenueData} />
        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tenant Activity Table - 2 columns */}
          <div className="lg:col-span-2">
            <TenantActivityTable tenants={mockTenants} />
          </div>

          {/* Right Column - 1 column */}
          <div className="space-y-6">
            <SystemHealthPanel
              systemStatus={systemStatus}
              resourceUsage={resourceUsage}
            />
            <RecentAlertsPanel alerts={recentAlerts} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionDistribution data={subscriptionDistribution} />
          <QuickActions />
        </div>
      </main>
    </DashboardLayout>
  )
}
