"use client"

import { motion } from "framer-motion"
import { Search, X } from "lucide-react"
import { cn } from "@skill-learn/lib/utils"

/**
 * SearchBar - Advanced search component with clear functionality
 */
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search courses and quizzes...",
  className
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all"
      />
      {value && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      )}
    </div>
  )
}
