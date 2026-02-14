"use client"

import { motion } from "framer-motion"
import { cn } from "@skill-learn/lib/utils"

/**
 * CategoryBadge - Displays a badge label for categories
 * @param {Object} props
 * @param {string} props.label - Badge text
 * @param {string} props.variant - Badge variant: 'recommended' | 'new'
 * @param {string} props.className - Additional CSS classes
 */
export function CategoryBadge({ label, variant = "recommended", className }) {
  const variantStyles = {
    recommended: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800"
    },
    new: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800"
    }
  }

  const styles = variantStyles[variant] || variantStyles.recommended
  const shouldPulse = variant === "new"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
        styles.bg,
        styles.text,
        styles.border,
        shouldPulse && "animate-pulse",
        className
      )}
    >
      {label}
    </motion.div>
  )
}
