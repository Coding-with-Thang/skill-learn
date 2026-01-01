"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * StatBadge - Displays a metric with an icon and animated counter
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.label - Label text for the stat
 * @param {number} props.value - Numeric value to display
 * @param {string} props.variant - Color variant: 'completed' | 'in-progress'
 * @param {string} props.className - Additional CSS classes
 */
export function StatBadge({
  icon: Icon,
  label,
  value,
  variant = "completed",
  className
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut"
    })
    return controls.stop
  }, [count, value])

  const variantStyles = {
    completed: {
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      cardBg: "bg-white dark:bg-card",
      border: "border-blue-100 dark:border-blue-900/30"
    },
    "in-progress": {
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      cardBg: "bg-white dark:bg-card",
      border: "border-orange-100 dark:border-orange-900/30"
    }
  }

  const styles = variantStyles[variant] || variantStyles.completed

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border shadow-sm",
        styles.cardBg,
        styles.border,
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-lg",
        styles.iconBg
      )}>
        <Icon className={cn("w-6 h-6", styles.iconColor)} />
      </div>
      <div className="flex flex-col">
        <motion.span className="text-2xl font-bold text-foreground">
          {rounded}
        </motion.span>
        <span className="text-sm text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
    </motion.div>
  )
}
