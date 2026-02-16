import { NextResponse } from "next/server";
import { toast } from "sonner";

// Error types
export const ErrorType = {
  AUTH: "auth",
  API: "api",
  VALIDATION: "validation",
  NETWORK: "network",
  NOT_FOUND: "not_found",
  UNKNOWN: "unknown",
};

// Standard error response structure
export class AppError extends Error {
  type: string;
  details: Record<string, unknown> | null;
  timestamp: string;
  status: number;

  constructor(
    message: string,
    type: string = ErrorType.UNKNOWN,
    details: Record<string, unknown> | null = null
  ) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.status = (details as { status?: number } | null)?.status ?? 500;
  }
}

/**
 * Handle API errors and return standardized NextResponse
 * @param {Error|AppError} error - The error object
 * @param {string|null} customMessage - Optional custom error message
 * @param {number|null} defaultStatus - Optional default status code
 * @returns {NextResponse} Standardized error response
 */
type ErrorLike = { response?: { status?: number; data?: { error?: string; message?: string } }; status?: number; message?: string };

export function handleApiError(error: unknown, customMessage: string | null = null, defaultStatus: number | null = null) {
  console.error("API Error:", error);

  let status: number = defaultStatus ?? 500;
  if (error instanceof AppError) {
    const d = error.details as { status?: number } | null;
    status = error.status ?? d?.status ?? 500;
  } else {
    const err = error as ErrorLike;
    if (err?.response?.status != null) status = err.response.status;
    else if (err?.status != null) status = err.status;
  }

  let message: string = customMessage ?? "An unexpected error occurred";
  if (error instanceof AppError) {
    message = error.message;
  } else {
    const err = error as ErrorLike;
    if (err?.response?.data?.error) message = err.response.data.error;
    else if (err?.response?.data?.message) message = err.response.data.message;
    else if (err?.message) message = err.message;
  }

  // Build error response (typed to allow fieldErrors and dynamic keys from details)
  const errorResponse: Record<string, unknown> = {
    success: false,
    error: message,
    type: error instanceof AppError ? error.type : ErrorType.UNKNOWN,
    timestamp: error instanceof AppError ? error.timestamp : new Date().toISOString(),
  };

  // Always include fieldErrors for validation errors so clients can show inline field errors
  if (error instanceof AppError && error.details && "fieldErrors" in error.details) {
    errorResponse.fieldErrors = (error.details as { fieldErrors: unknown }).fieldErrors;
  }

  // Copy safe extra keys from AppError.details (e.g. redirectToSignup, contactSales) to the response
  if (error instanceof AppError && error.details && typeof error.details === "object" && !Array.isArray(error.details)) {
    const reserved = ["status", "fieldErrors"];
    for (const [key, value] of Object.entries(error.details)) {
      if (!reserved.includes(key) && errorResponse[key] === undefined) {
        errorResponse[key] = value;
      }
    }
  }

  // Add details in development mode (stack, etc.)
  if (process.env.NODE_ENV === "development") {
    errorResponse.details = error instanceof AppError
      ? error.details
      : (error as ErrorLike & { details?: unknown; stack?: string }).details ?? (error instanceof Error ? error.stack : undefined);
  }

  return NextResponse.json(errorResponse, { status });
}

/**
 * Legacy function for backward compatibility
 * Returns error object instead of NextResponse
 * @deprecated Use handleApiError instead
 */
export function handleApiErrorLegacy(error: unknown, customMessage: string | null = null) {
  console.error("API Error:", error);
  const err = error as { message?: string; response?: { status?: number }; status?: number; details?: unknown; stack?: string };

  const errorResponse: Record<string, unknown> = {
    success: false,
    error: customMessage || err?.message || "An unexpected error occurred",
    status: err?.response?.status || err?.status || 500,
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.details = err?.details ?? err?.stack;
  }

  return errorResponse;
}

// Handle client-side errors with UI feedback
export function handleClientError(
  error,
  fallbackMessage = "An error occurred"
) {
  const message =
    error.response?.data?.error || error.message || fallbackMessage;

  // Show toast notification for user feedback
  toast.error(message);

  // Log to console only in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Client Error:", error);
  }

  return {
    error: message,
    type: error.type || ErrorType.UNKNOWN,
    timestamp: new Date().toISOString(),
  };
}

// Validate input data
type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
};

export function validateInput(
  data: Record<string, unknown>,
  rules: Record<string, ValidationRule>
) {
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && !value) {
      errors.push(`${field} is required`);
    }

    if (rule.min != null && typeof value === "number" && value < rule.min) {
      errors.push(`${field} must be at least ${rule.min}`);
    }

    if (rule.max != null && typeof value === "number" && value > rule.max) {
      errors.push(`${field} must be no more than ${rule.max}`);
    }

    if (rule.pattern && value != null && !rule.pattern.test(String(value))) {
      errors.push(`${field} format is invalid`);
    }
  }

  if (errors.length > 0) {
    throw new AppError(errors.join(", "), ErrorType.VALIDATION);
  }

  return true;
}

// Format error for API response
export function formatApiError(
  error,
  defaultMessage = "Internal server error"
) {
  return {
    success: false,
    error: error.message || defaultMessage,
    type: error.type || ErrorType.UNKNOWN,
    ...(process.env.NODE_ENV === "development" && {
      details: error.details || error.stack,
    }),
    status: error.status || 500,
  };
}
