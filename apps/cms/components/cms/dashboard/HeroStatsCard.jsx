'use client'

import { Card, CardContent } from "@skill-learn/ui/components/card"
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, formatPercentage } from '@/lib/cms/utils'

export default function HeroStatsCard({ stat, index }) {
  const isPositive = stat.trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-linear-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              </div>
              {stat.status && (
                <div className="flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    {stat.status}
                  </span>
                </div>
              )}
            </div>

            {/* Trend */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatPercentage(Math.abs(stat.trend))}
              </div>
              <span className="text-xs text-muted-foreground">
                {stat.trendLabel}
              </span>
            </div>

            {/* Sparkline */}
            <div className="h-12 flex items-end gap-0.5">
              {stat.sparklineData.map((value, i) => {
                const max = Math.max(...stat.sparklineData)
                const height = (value / max) * 100
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1 + i * 0.05, duration: 0.3 }}
                    className={cn(
                      "flex-1 rounded-sm",
                      isPositive
                        ? "bg-linear-to-t from-green-500 to-green-400"
                        : "bg-linear-to-t from-primary to-primary/70"
                    )}
                  />
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
