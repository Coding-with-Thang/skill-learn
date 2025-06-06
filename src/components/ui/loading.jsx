"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSpinner({ className, size = "default" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  }

  return (
    <div className="flex justify-center items-center w-full p-4">
      <Loader2 className={`animate-spin text-muted-foreground ${sizeClasses[size]} ${className}`} />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[80dvh]">
      <Card className="w-full p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <LoadingSpinner size="large" />
          <p className="text-muted-foreground">Loading your content...</p>
        </div>
      </Card>
    </div>
  )
}

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-8 w-48" /></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingUserBadge() {
  return (
    <div className="relative min-h-[50rem] h-full w-full flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
        <Skeleton className="h-40 w-40 rounded-full" />
        <Skeleton className="h-12 w-64" />
        <div className="mt-10 px-4 sm:px-10 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LoadingUserStats() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Card className="min-h-[15rem] p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-48 w-48 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function LoadingHeader() {
  return (
    <header className="sticky top-0 w-full bg-white border-b-2 z-1000">
      <div className="flex items-center h-16 justify-between px-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </header>
  )
} 