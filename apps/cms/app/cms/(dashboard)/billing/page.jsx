'use client'

import DashboardLayout from '@/components/cms/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/cms/utils'

const subscriptionData = [
  { name: 'Enterprise', value: 35, count: 750, color: '#6366F1' },
  { name: 'Pro', value: 30, count: 640, color: '#8B5CF6' },
  { name: 'Free', value: 35, count: 750, color: '#94A3B8' },
]

const churnData = [
  { month: 'Jan', upgrades: 45, downgrades: 12 },
  { month: 'Feb', upgrades: 52, downgrades: 18 },
  { month: 'Mar', upgrades: 38, downgrades: 25 },
  { month: 'Apr', upgrades: 65, downgrades: 15 },
  { month: 'May', upgrades: 72, downgrades: 10 },
  { month: 'Jun', upgrades: 85, downgrades: 8 },
]

const recentInvoices = [
  {
    id: 'INV-2024-001',
    tenant: 'Acme Corp',
    logo: 'A',
    date: 'Oct 24, 2024',
    amount: 2499.00,
    plan: 'Enterprise',
    status: 'Paid',
  },
  {
    id: 'INV-2024-002',
    tenant: 'Globex Inc.',
    logo: 'G',
    date: 'Oct 23, 2024',
    amount: 499.00,
    plan: 'Pro',
    status: 'Failed',
  },
  {
    id: 'INV-2024-003',
    tenant: 'Stark Industries',
    logo: 'S',
    date: 'Oct 22, 2024',
    amount: 2499.00,
    plan: 'Enterprise',
    status: 'Paid',
  },
  {
    id: 'INV-2024-004',
    tenant: 'Umbrella Corp',
    logo: 'U',
    date: 'Oct 21, 2024',
    amount: 1299.00,
    plan: 'Pro',
    status: 'Pending',
  },
]

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 w-full">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground">Billing & Revenue</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Revenue Overview</h1>
            <p className="text-muted-foreground mt-1">
              Financial performance across all LMS tenants.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </Button>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Recurring Revenue</p>
                    <h3 className="text-3xl font-bold">$124,500</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">5.2%</span>
                      <span className="text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Churn Rate</p>
                    <h3 className="text-3xl font-bold">2.1%</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">0.4%</span>
                      <span className="text-muted-foreground">vs last month (Good)</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                    <span className="text-2xl">📉</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Revenue Per User</p>
                    <h3 className="text-3xl font-bold">$850</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">1.2%</span>
                      <span className="text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                    <span className="text-2xl">👤</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Subscription Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">Active tenants by plan tier</p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <p className="text-3xl font-bold">2,140</p>
                    <p className="text-sm text-muted-foreground">Total Tenants</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {subscriptionData.map((item) => (
                    <div key={item.name} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <p className="text-2xl font-bold">{item.value}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Churn & Retention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Churn & Retention Trends</CardTitle>
                    <p className="text-sm text-muted-foreground">Upgrades vs Downgrades (Last 6 Months)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-green-500" />
                      <span>Upgrades</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-red-500" />
                      <span>Downgrades/Churn</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={churnData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="upgrades" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="downgrades" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Button variant="link" className="text-primary">
                  View All Invoices
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="pb-3 text-left font-medium">TENANT</th>
                      <th className="pb-3 text-left font-medium">INVOICE ID</th>
                      <th className="pb-3 text-left font-medium">DATE</th>
                      <th className="pb-3 text-left font-medium">AMOUNT</th>
                      <th className="pb-3 text-left font-medium">PLAN</th>
                      <th className="pb-3 text-left font-medium">STATUS</th>
                      <th className="pb-3 text-left font-medium">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold">
                              {invoice.logo}
                            </div>
                            <span className="font-medium">{invoice.tenant}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">{invoice.id}</td>
                        <td className="py-4 text-sm">{invoice.date}</td>
                        <td className="py-4 font-medium">{formatCurrency(invoice.amount)}</td>
                        <td className="py-4">
                          <Badge variant="outline">{invoice.plan}</Badge>
                        </td>
                        <td className="py-4">
                          <Badge className={cn(
                            invoice.status === 'Paid' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            invoice.status === 'Failed' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            invoice.status === 'Pending' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
