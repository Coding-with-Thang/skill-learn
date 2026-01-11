'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Badge } from '@/components/cms/ui/badge'
import { Button } from '@/components/cms/ui/button'
import { AlertTriangle, CheckCircle, XCircle, Info, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatTimeAgo } from '@/lib/cms/utils'

const alertIcons = {
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const alertColors = {
  warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
  success: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  error: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
  info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
}

export default function RecentAlertsPanel({ alerts }) {
  const newAlertsCount = alerts.filter(a => a.isNew).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Recent Alerts
              {newAlertsCount > 0 && (
                <Badge variant="destructive" className="h-5 px-2">
                  {newAlertsCount} New
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alertIcons[alert.type]
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className={`rounded-full p-1.5 ${alertColors[alert.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">
                      {alert.message}
                    </p>
                    {alert.isNew && (
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(alert.time)}
                  </p>
                </div>
              </motion.div>
            )
          })}

          <Button
            variant="ghost"
            className="w-full justify-between group"
          >
            <span>View All Alerts</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
