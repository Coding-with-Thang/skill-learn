"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { CheckCircle, Circle, Clock } from "lucide-react"
import { cn } from "@skill-learn/lib/utils.js"
import { EnhancedButton } from "./enhanced-button"

/**
 * QuizCard - Displays quiz information with completion status
 */
export function QuizCard({
  quiz,
  onClick,
  variant = "grid" // "grid" or "list"
}) {
  const isListView = variant === "list"
  const isCompleted = quiz.status === "completed"

  if (isListView) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        className="group cursor-pointer"
        onClick={onClick}
      >
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300",
          isCompleted
            ? "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10"
            : "border-border hover:border-brand-teal/50"
        )}>
          {/* Thumbnail */}
          {quiz.imageUrl && (
            <div className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden">
              <Image
                src={quiz.imageUrl}
                alt={quiz.title}
                fill
                sizes="128px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground group-hover:text-brand-teal transition-colors line-clamp-1">
              {quiz.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {quiz.description}
            </p>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3 fill-current" />
              <span>{quiz.questionCount} Questions</span>
            </div>
            {isCompleted && quiz.score && (
              <span className="font-semibold text-green-600 dark:text-green-400">
                {quiz.score}%
              </span>
            )}
          </div>

          {/* Action */}
          <EnhancedButton
            size="sm"
            variant={isCompleted ? "outline" : "default"}
            className={cn(
              !isCompleted && "bg-brand-teal hover:bg-brand-teal-dark text-white"
            )}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            {isCompleted ? "Retake" : "Start Quiz"}
          </EnhancedButton>
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
      <div className={cn(
        "relative rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300",
        isCompleted
          ? "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10"
          : "border-border hover:border-brand-teal/50"
      )}>
        {/* Thumbnail */}
        {quiz.imageUrl && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={quiz.imageUrl}
              alt={quiz.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          <h4 className="font-bold text-foreground group-hover:text-brand-teal transition-colors line-clamp-2 mb-2">
            {quiz.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {quiz.description}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3 fill-current" />
              <span>{quiz.questionCount || 20} Questions</span>
            </div>
            {isCompleted && quiz.score && (
              <span className="font-semibold text-green-600 dark:text-green-400">
                Score: {quiz.score}%
              </span>
            )}
          </div>

          {/* Action Button */}
          <EnhancedButton
            className={cn(
              "w-full",
              isCompleted
                ? "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "bg-brand-teal hover:bg-brand-teal-dark text-white"
            )}
            variant={isCompleted ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            {isCompleted ? "Retake Quiz" : "Start Quiz"}
          </EnhancedButton>
        </div>
      </div>
    </motion.div>
  )
}
