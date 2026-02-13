import * as React from "react"
import { cn } from "@skill-learn/lib/utils.js"

const AnimatedProgress = React.forwardRef(({
  className,
  value = 0,
  max = 100,
  variant = "default",
  size = "default",
  showLabel = false,
  animated = true,
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-muted",
        // Size variants
        size === "sm" && "h-2",
        size === "default" && "h-3",
        size === "lg" && "h-4",
        className
      )}
      {...props}
    >
      {/* Background track */}
      <div className="h-full w-full bg-muted" />

      {/* Progress bar */}
      <div
        className={cn(
          "h-full transition-all duration-1000 ease-out",
          animated && "animate-in slide-in-from-left-1",
          // Variant colors
          variant === "default" && "bg-primary",
          variant === "success" && "bg-success",
          variant === "warning" && "bg-warning",
          variant === "error" && "bg-error",
          variant === "info" && "bg-info",
          // Gradient variants
          variant === "gradient" && "bg-linear-to-r from-primary to-accent",
          variant === "rainbow" && "bg-linear-to-r from-error via-warning to-success",
        )}
        style={{
          width: isVisible ? `${percentage}%` : "0%",
          transition: animated ? "width 1s cubic-bezier(0.4, 0, 0.2, 1)" : "none"
        }}
      >
        {/* Animated shimmer effect */}
        {animated && (
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "text-xs font-medium",
            size === "sm" && "text-xs",
            size === "default" && "text-sm",
            size === "lg" && "text-base"
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
})
AnimatedProgress.displayName = "AnimatedProgress"

// Progress ring variant
const AnimatedProgressRing = React.forwardRef(({
  className,
  value = 0,
  max = 100,
  size = 100,
  strokeWidth = 8,
  variant = "default",
  showLabel = true,
  animated = true,
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            "transition-all duration-1000 ease-out",
            // Variant colors
            variant === "default" && "text-primary",
            variant === "success" && "text-success",
            variant === "warning" && "text-warning",
            variant === "error" && "text-error",
            variant === "info" && "text-info",
          )}
          style={{
            transition: animated ? "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" : "none"
          }}
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
})
AnimatedProgressRing.displayName = "AnimatedProgressRing"

export { AnimatedProgress, AnimatedProgressRing } 