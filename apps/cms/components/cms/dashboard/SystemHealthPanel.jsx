'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Progress } from '@/components/cms/ui/progress'
import { motion } from 'framer-motion'
import { cn, getProgressColor } from '@/lib/cms/utils'
import { Activity, Database, HardDrive, Mail, CreditCard } from 'lucide-react'

const statusIcons = {
  'API Server': Activity,
  'Database': Database,
  'Storage': HardDrive,
  'Email Service': Mail,
  'Payment Gateway': CreditCard,
}

export default function SystemHealthPanel({ systemStatus, resourceUsage }) {
  const getStatusIcon = (status) => {
    if (status === 'Operational') return '🟢'
    if (status === 'Warning') return '🟡'
    return '🔴'
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
            const key = service?.name || `system-status-${index}`
            return (
              <motion.div
                key={key}
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
                    service.status === 'Operational' && "text-green-600 dark:text-green-400",
                    service.status === 'Warning' && "text-amber-600 dark:text-amber-400",
                    service.status === 'Error' && "text-red-600 dark:text-red-400"
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
            const key = resource?.name || `resource-usage-${index}`
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{resource.name}</span>
                  <span className={cn(
                    "font-medium",
                    resource.percentage >= 85 && "text-red-600 dark:text-red-400",
                    resource.percentage >= 70 && resource.percentage < 85 && "text-amber-600 dark:text-amber-400",
                    resource.percentage < 70 && "text-green-600 dark:text-green-400"
                  )}>
                    {resource.percentage}%
                  </span>
                </div>
                <Progress
                  value={resource.percentage}
                  indicatorClassName={getProgressColor(resource.percentage)}
                />
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
