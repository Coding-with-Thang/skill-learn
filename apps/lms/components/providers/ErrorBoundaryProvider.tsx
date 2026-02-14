"use client"

import { ErrorBoundary } from "@skill-learn/ui/components/error-boundary"

export function ErrorBoundaryProvider({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
} 