import { toast } from "sonner";

// Error types
export const ErrorType = {
  AUTH: "auth",
  API: "api",
  VALIDATION: "validation",
  NETWORK: "network",
  UNKNOWN: "unknown",
};

// Standard error response structure
export class AppError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, details = null) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Handle API errors
export function handleApiError(error, customMessage = null) {
  console.error("API Error:", error);

  const errorResponse = {
    success: false,
    error: customMessage || error.message || "An unexpected error occurred",
    status: error.response?.status || 500,
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
  console.error("Client Error:", error);

  const message =
    error.response?.data?.error || error.message || fallbackMessage;

  // Show toast notification for user feedback
  toast.error(message);

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
