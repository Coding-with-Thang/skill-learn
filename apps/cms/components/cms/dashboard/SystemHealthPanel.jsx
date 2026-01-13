'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Progress } from '@/components/cms/ui/progress'
import { motion } from 'framer-motion'
import { cn, getProgressColor } from '@/lib/cms/utils'
import { Activity, Database, HardDrive, Mail, CreditCard, Server } from 'lucide-react'

const statusIcons = {
  'API Server': Activity,
  'Database': Database,
  'Storage': HardDrive,
  'Email Service': Mail,
  'Payment Gateway': CreditCard,
  'Redis Cache': Database,
  'Auth Service': Shield,
  'API Gateway': Server,
  'Database Cluster': Database,
  'Storage Service': HardDrive,
}

// Fallback icon imports if needed or rely on importing them above
// Note: Shield is not imported above, need to add it.
import { Shield } from 'lucide-react'

export default function SystemHealthPanel({ systemStatus, resourceUsage }) {
  const getStatusIcon = (status) => {
    const s = status?.toLowerCase()
    if (s === 'operational') return '🟢'
    if (s === 'warning') return '🟡'
    return '🔴'
  }

  const getStatusColor = (status) => {
    const s = status?.toLowerCase()
    if (s === 'operational') return "text-green-600 dark:text-green-400"
    if (s === 'warning') return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="space-y-6"
    >
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemStatus.map((service, index) => {
            const Icon = statusIcons[service.name] || Activity
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {service.uptime && (
                        <span>{service.uptime}% uptime</span>
                      )}
                      {service.latency && (
                        <>
                          <span>•</span>
                          <span>{service.latency} latency</span>
                        </>
                      )}
                      {service.capacity && (
                        <>
                          <span>•</span>
                          <span>{service.capacity}% capacity</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium",
                    getStatusColor(service.status)
                  )}>
                    {service.status}
                  </span>
                  <span className="text-lg">{getStatusIcon(service.status)}</span>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resourceUsage.map((resource, index) => {
            const name = resource.name || resource.resource
            // Calculate percentage if not provided directly
            let percentage = resource.percentage
            if (percentage === undefined && resource.value !== undefined && resource.limit !== undefined) {
              percentage = Math.round((resource.value / resource.limit) * 100)
            }
            if (percentage === undefined) percentage = 0

            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span className={cn(
                    "font-medium",
                    percentage >= 85 && "text-red-600 dark:text-red-400",
                    percentage >= 70 && percentage < 85 && "text-amber-600 dark:text-amber-400",
                    percentage < 70 && "text-green-600 dark:text-green-400"
                  )}>
                    {percentage}%
                  </span>
                </div>
                <Progress
                  value={percentage}
                  indicatorClassName={getProgressColor(percentage)}
                />
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
