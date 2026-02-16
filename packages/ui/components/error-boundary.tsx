"use client"

import { Component } from "react"
import { Button } from "./button"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  message?: string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorCard
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={this.resetError}
          message={this.props.message || "Something went wrong!"}
          {...(this.props.className != null && { className: this.props.className })}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorCardProps {
  error: Error | null;
  errorInfo?: React.ErrorInfo | null;
  reset?: () => void;
  message?: string;
  className?: string;
}

export function ErrorCard({
  error,
  errorInfo,
  reset,
  message = "Something went wrong!",
  className = ""
}: ErrorCardProps) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-brand-tealestructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">{message}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.message || "An unexpected error occurred. Please try again."}
          </p>
          {process.env.NODE_ENV === 'development' && errorInfo && (
            <pre className="mt-2 text-xs text-left max-h-32 overflow-auto p-2 bg-muted rounded">
              <code>{errorInfo.componentStack}</code>
            </pre>
          )}
        </div>
        {reset && (
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
        )}
      </div>
    </div>
  )
} 