"use client"

import { ErrorBoundary } from "@/components/ui/error-boundary"

export function ErrorBoundaryProvider({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
} 