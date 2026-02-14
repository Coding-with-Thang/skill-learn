"use client"

import { cn } from "@skill-learn/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-4xld bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
