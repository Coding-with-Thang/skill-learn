"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const loaderVariants = {
  spinner: "spinner",
  page: "page",
  card: "card",
  gif: "gif",
  fullscreen: "fullscreen"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  icon: "h-4 w-4"
}

/**
 * Unified Loader Component
 * 
 * @param {string} variant - 'spinner', 'page', 'card', 'gif', 'fullscreen'
 * @param {string} size - 'sm', 'md', 'lg', 'xl', 'icon'
 * @param {string} className - Additional classes
 * @param {string} text - Optional text to display
 * @param {object} props - Additional props
 */
export function Loader({
  variant = "spinner",
  size = "md",
  className,
  text,
  ...props
}) {
  // Default Spinner
  if (variant === "spinner") {
    return (
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size] || sizeClasses.md,
          className
        )}
        {...props}
      />
    )
  }

  // GIF Loader (from shared/loader.jsx)
  if (variant === "gif") {
    return (
      <div className={cn("flex flex-col gap-2 justify-center items-center", className)} {...props}>
        <Image
          src="/loader.gif"
          alt={text || "Loading..."}
          height={300}
          width={300}
          unoptimized
          className={cn(
            size === "sm" && "h-16 w-16",
            size === "md" && "h-32 w-32",
            size === "lg" && "h-64 w-64",
            // Default explicit dimensions if no size override matches widely
          )}
        />
        {text && <p className="my-4 text-xl text-muted-foreground">{text}</p>}
      </div>
    )
  }

  // Page Loader (Centralized Card)
  if (variant === "page") {
    return (
      <div className={cn("container mx-auto px-4 py-8 min-h-[80dvh] flex items-center justify-center", className)} {...props}>
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className={cn("animate-spin text-primary", sizeClasses.lg)} />
            <p className="text-muted-foreground">{text || "Loading your content..."}</p>
          </div>
        </Card>
      </div>
    )
  }

  // Fullscreen Overlay
  if (variant === "fullscreen") {
    return (
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)} {...props}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={cn("animate-spin text-primary", sizeClasses.xl)} />
          {text && <p className="text-lg font-medium text-foreground">{text}</p>}
        </div>
      </div>
    )
  }

  // Fallback
  return null
}
