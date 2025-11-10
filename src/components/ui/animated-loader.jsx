import * as React from "react"
import { cn } from "@/lib/utils"

const AnimatedLoader = React.forwardRef(({
  className,
  size = "default",
  variant = "spinner",
  text,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      {variant === "spinner" && (
        <div className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-primary",
          size === "sm" && "h-4 w-4",
          size === "default" && "h-8 w-8",
          size === "lg" && "h-12 w-12",
          size === "xl" && "h-16 w-16"
        )} />
      )}

      {variant === "dots" && (
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "animate-pulse rounded-full bg-primary",
                size === "sm" && "h-1 w-1",
                size === "default" && "h-2 w-2",
                size === "lg" && "h-3 w-3",
                size === "xl" && "h-4 w-4"
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.4s"
              }}
            />
          ))}
        </div>
      )}

      {variant === "pulse" && (
        <div className={cn(
          "animate-pulse rounded-full bg-primary",
          size === "sm" && "h-4 w-4",
          size === "default" && "h-8 w-8",
          size === "lg" && "h-12 w-12",
          size === "xl" && "h-16 w-16"
        )} />
      )}

      {variant === "bars" && (
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "animate-pulse bg-primary rounded-sm",
                size === "sm" && "h-4 w-1",
                size === "default" && "h-8 w-2",
                size === "lg" && "h-12 w-3",
                size === "xl" && "h-16 w-4"
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "1.2s"
              }}
            />
          ))}
        </div>
      )}

      {variant === "ring" && (
        <div className={cn(
          "relative",
          size === "sm" && "h-4 w-4",
          size === "default" && "h-8 w-8",
          size === "lg" && "h-12 w-12",
          size === "xl" && "h-16 w-16"
        )}>
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-muted",
            "animate-ping"
          )} />
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-primary",
            "animate-pulse"
          )} />
        </div>
      )}

      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
})
AnimatedLoader.displayName = "AnimatedLoader"

// Skeleton loader component
const Skeleton = React.forwardRef(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "animate-pulse rounded-md bg-muted",
      className
    )}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

// Content loader with shimmer effect
const ContentLoader = React.forwardRef(({
  className,
  lines = 3,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("space-y-3", className)}
    {...props}
  >
    {[...Array(lines)].map((_, i) => (
      <div key={i} className="flex space-x-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 flex-1 rounded" />
      </div>
    ))}
  </div>
))
ContentLoader.displayName = "ContentLoader"

export { AnimatedLoader, Skeleton, ContentLoader } 