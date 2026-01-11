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
  constructor(message, type = ErrorType.UNKNOWN, details = null) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.status = details?.status || 500;
  }
}

/**
 * Handle API errors and return standardized NextResponse
 * @param {Error|AppError} error - The error object
 * @param {string|null} customMessage - Optional custom error message
 * @param {number|null} defaultStatus - Optional default status code
 * @returns {NextResponse} Standardized error response
 */
export function handleApiError(error, customMessage = null, defaultStatus = null) {
  console.error("API Error:", error);

  // Determine status code
  let status = defaultStatus || 500;
  
  if (error instanceof AppError) {
    status = error.status || error.details?.status || 500;
  } else if (error.response?.status) {
    status = error.response.status;
  } else if (error.status) {
    status = error.status;
  }

  // Determine error message
  let message = customMessage || "An unexpected error occurred";
  
  if (error instanceof AppError) {
    message = error.message;
  } else if (error.response?.data?.error) {
    message = error.response.data.error;
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  // Build error response
  const errorResponse = {
    success: false,
    error: message,
    type: error instanceof AppError ? error.type : ErrorType.UNKNOWN,
    timestamp: error instanceof AppError ? error.timestamp : new Date().toISOString(),
  };

  // Add details in development mode
  if (process.env.NODE_ENV === "development") {
    errorResponse.details = error instanceof AppError 
      ? error.details 
      : error.details || error.stack;
  }

  return NextResponse.json(errorResponse, { status });
}

/**
 * Legacy function for backward compatibility
 * Returns error object instead of NextResponse
 * @deprecated Use handleApiError instead
 */
export function handleApiErrorLegacy(error, customMessage = null) {
  console.error("API Error:", error);

  const errorResponse = {
    success: false,
    error: customMessage || error.message || "An unexpected error occurred",
    status: error.response?.status || error.status || 500,
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.details = error.details || error.stack;
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
export function validateInput(data, rules) {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && !value) {
      errors.push(`${field} is required`);
    }

    if (rule.min && value < rule.min) {
      errors.push(`${field} must be at least ${rule.min}`);
    }

    if (rule.max && value > rule.max) {
      errors.push(`${field} must be no more than ${rule.max}`);
    }

    if (rule.pattern && !rule.pattern.test(value)) {
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
