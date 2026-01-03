"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Clock, BookOpen, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { EnhancedButton } from "./enhanced-button"
import { Progress } from "./progress"

/**
 * CourseCard - Displays course information with progress tracking
 */
export function CourseCard({
  course,
  onClick,
  variant = "grid" // "grid" or "list"
}) {
  const isListView = variant === "list"

  const getStatusColor = (status) => {
    const colors = {
      "not-started": "text-muted-foreground",
      "in-progress": "text-orange-600 dark:text-orange-400",
      completed: "text-green-600 dark:text-green-400"
    }
    return colors[status] || colors["not-started"]
  }

  if (isListView) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-brand-teal/50 hover:shadow-md transition-all duration-300">
          {/* Thumbnail */}
          <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={course.imageUrl || "/placeholder-course.jpg"}
              alt={course.title}
              fill
              sizes="128px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground group-hover:text-brand-teal transition-colors line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {course.excerptDescription || course.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                {course.progress > 0 ? (
                  <span className={cn("text-sm font-medium", getStatusColor(course.status))}>
                    {course.progress}%
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Not Started</span>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration || "4h 30m"}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.moduleCount || 12} Modules</span>
              </div>
              {course.progress > 0 && (
                <div className="flex-1 max-w-xs">
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center">
            <EnhancedButton
              size="sm"
              className={cn(
                course.progress > 0
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-brand-teal hover:bg-brand-teal-dark",
                "text-white"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              {course.progress > 0 ? "Continue" : "Start Now"}
            </EnhancedButton>
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative rounded-xl border border-border bg-card overflow-hidden hover:border-brand-teal/50 hover:shadow-lg transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={course.imageUrl || "/placeholder-course.jpg"}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {course.progress > 0 && (
            <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-2">
              <div className="relative w-8 h-8">
                <svg className="transform -rotate-90 w-8 h-8">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - course.progress / 100)}`}
                    className="text-brand-teal"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {course.progress}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground group-hover:text-brand-teal transition-colors line-clamp-2 mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.excerptDescription || course.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration || "4h 30m"}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.moduleCount || 12} Modules</span>
            </div>
          </div>

          {/* Progress Bar */}
          {course.progress > 0 && (
            <div className="mb-4">
              <Progress value={course.progress} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          <EnhancedButton
            className={cn(
              "w-full",
              course.progress > 0
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-brand-teal hover:bg-brand-teal-dark",
              "text-white"
            )}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            {course.progress > 0 ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Continue
              </>
            ) : (
              "Start Now"
            )}
          </EnhancedButton>
        </div>
      </div>
    </motion.div>
  )
}
