"use client"

import { ErrorBoundary } from "@skill-learn/ui/components/error-boundary"

/**
 * Page-level error boundary wrapper
 * Use this to wrap page content for granular error handling
 * 
 * @param {React.ReactNode} children - Page content to wrap
 * @param {string} pageName - Name of the page for error messages
 * @param {string} className - Optional className for the error boundary
 */
export function PageErrorBoundary({ children, pageName = "page", className = "" }) {
  return (
    <ErrorBoundary 
      message={`Failed to load ${pageName}`}
      className={className}
    >
      {children}
    </ErrorBoundary>
  )
}

