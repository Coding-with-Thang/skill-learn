"use client"

import { motion } from "framer-motion"
import { Play, Clock } from "lucide-react"
import { cn } from "@skill-learn/lib/utils"
import { EnhancedButton } from "./enhanced-button"
import { Progress } from "./progress"

/**
 * ProgressCard - Displays user's current training progress
 * @param {Object} props
 * @param {string} props.title - Module/Quiz title
 * @param {string} props.category - Category name
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.timeRemaining - Estimated time remaining
 * @param {Function} props.onResume - Resume button click handler
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
export function ProgressCard({
  title,
  category,
  progress = 0,
  timeRemaining,
  onResume,
  isLoading = false,
  className
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card shadow-md hover:shadow-lg transition-shadow duration-300",
        className
      )}
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-teal via-blue-500 to-purple-500" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 mb-4">
              <Play className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-foreground mb-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Module 3 of {category} • {timeRemaining} remaining
            </p>

            {/* Progress bar */}
            <div className="mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Progress
                  value={progress}
                  className="h-2"
                  indicatorClassName="bg-linear-to-r from-orange-500 to-orange-600"
                />
              </motion.div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {progress}% Complete
                </span>
                {timeRemaining && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{timeRemaining}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume button */}
          <EnhancedButton
            onClick={onResume}
            loading={isLoading}
            className="bg-brand-teal hover:bg-brand-teal-dark text-white whitespace-nowrap"
          >
            Resume Training
          </EnhancedButton>
        </div>
      </div>
    </motion.div>
  )
}
