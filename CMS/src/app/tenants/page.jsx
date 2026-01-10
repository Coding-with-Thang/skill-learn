'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Search, MoreVertical, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, getStatusColor, getPlanColor } from '@/lib/utils'
import Link from 'next/link'

const tenants = [
  {
    id: 1,
    name: 'Acme Corp',
    domain: 'acme.lms.com',
    logo: 'A',
    plan: 'Enterprise',
    status: 'Active',
    activeUsers: 850,
    maxUsers: 1000,
    storage: 2.1,
    maxStorage: 5,
    alert: null,
  },
  {
    id: 2,
    name: 'Globex Inc.',
    domain: 'lms.globex.com',
    logo: 'G',
    plan: 'Pro Tier',
    status: 'Active',
    activeUsers: 124,
    maxUsers: 200,
    storage: 45,
    maxStorage: 500,
    storageUnit: 'GB',
    alert: null,
  },
  {
    id: 3,
    name: 'Stark Ind.',
    domain: 'stark.lms.com',
    logo: 'S',
    plan: 'Enterprise',
    status: 'Suspended',
    activeUsers: 2100,
    maxUsers: 2500,
    storage: 8.5,
    maxStorage: 10,
    alert: 'Account suspended due to non-payment',
  },
  {
    id: 4,
    name: 'Pied Piper',
    domain: 'pied.lms.com',
    logo: 'P',
    plan: 'Trial',
    status: 'Active',
    activeUsers: 45,
    maxUsers: 50,
    storage: 12,
    maxStorage: 100,
    storageUnit: 'GB',
    alert: 'Trial ends in 3 days',
  },
  {
    id: 5,
    name: 'Umbrella Corp',
    domain: 'umbrella.lms.com',
    logo: 'U',
    plan: 'Enterprise',
    status: 'Active',
    activeUsers: 5430,
    maxUsers: 10000,
    storage: 18.2,
    maxStorage: 50,
    alert: null,
  },
  {
    id: 6,
    name: 'Hooli',
    domain: 'hooli.lms.com',
    logo: 'H',
    plan: 'Pro Tier',
    status: 'Inactive',
    activeUsers: 0,
    maxUsers: 200,
    storage: 0,
    maxStorage: 500,
    storageUnit: 'GB',
    alert: null,
  },
]

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.domain.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubscription = subscriptionFilter === 'all' || tenant.plan === subscriptionFilter
    const matchesStatus = statusFilter === 'all' || tenant.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesSubscription && matchesStatus
  })

  const getStoragePercentage = (used, max) => {
    return (used / max) * 100
  }

  const getUserPercentage = (active, max) => {
    return (active / max) * 100
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-amber-500'
    return 'bg-blue-500'
  }

  return (
    <DashboardLayout>
      <div className="p-6 w-full">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground">Tenants</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
            <p className="text-muted-foreground mt-1">
              Oversee and manage all organization tenants across the platform.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Tenant
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tenants by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Subscription Tier</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Pro Tier">Pro Tier</option>
            <option value="Trial">Trial</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Region</option>
            <option value="us">US</option>
            <option value="eu">EU</option>
            <option value="asia">Asia</option>
          </select>

          <Button variant="ghost" className="text-primary">
            Clear all
          </Button>
        </div>

        {/* Tenant Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredTenants.map((tenant, index) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-xl font-semibold">
                        {tenant.logo}
                      </div>
                      <div>
                        <h3 className="font-semibold">{tenant.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
                          {tenant.domain}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={cn("font-medium", getPlanColor(tenant.plan))}>
                      {tenant.plan}
                    </Badge>
                    <Badge className={cn("font-medium", getStatusColor(tenant.status))}>
                      {tenant.status}
                    </Badge>
                  </div>

                  {/* Alert */}
                  {tenant.alert && (
                    <div className={cn(
                      "mb-4 rounded-lg p-2 text-xs",
                      tenant.status === 'Suspended'
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {tenant.alert}
                    </div>
                  )}

                  {/* Active Users */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-medium">
                        {tenant.activeUsers.toLocaleString()} / {tenant.maxUsers.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={getUserPercentage(tenant.activeUsers, tenant.maxUsers)}
                      indicatorClassName={getProgressColor(getUserPercentage(tenant.activeUsers, tenant.maxUsers))}
                    />
                  </div>

                  {/* Storage */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <span>☁️</span> Storage:
                      </span>
                      <span className="font-medium">
                        {tenant.storage} {tenant.storageUnit || 'TB'} / {tenant.maxStorage} {tenant.storageUnit || 'TB'}
                      </span>
                    </div>
                    <Progress
                      value={getStoragePercentage(tenant.storage, tenant.maxStorage)}
                      indicatorClassName={getProgressColor(getStoragePercentage(tenant.storage, tenant.maxStorage))}
                    />
                  </div>

                  {/* Action Button */}
                  <Link href={`/tenants/${tenant.id}`}>
                    <Button variant="outline" className="w-full">
                      Manage Tenant
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
            <span className="font-medium">128</span> tenants
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
