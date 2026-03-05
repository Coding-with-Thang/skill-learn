"use client"

import { useTranslations } from "next-intl"
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
  const t = useTranslations("pageErrorBoundary")
  return (
    <ErrorBoundary
      message={t("failedToLoad", { pageName })}
      className={className}
    >
      {children}
    </ErrorBoundary>
  )
}

