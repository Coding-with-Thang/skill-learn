"use client"

import { Component } from "react"
import { Button } from "./button.jsx"
import { AlertCircle } from "lucide-react"

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
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
          className={this.props.className}
        />
      )
    }

    return this.props.children
  }
}

export function ErrorCard({
  error,
  errorInfo,
  reset,
  message = "Something went wrong!",
  className = ""
}) {
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