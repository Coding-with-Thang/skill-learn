/**
 * Retry utility with exponential backoff
 * Handles network errors, 5xx errors, and rate limiting (429)
 */

/**
 * Check if an error should be retried
 * @param {Error} error - The error object
 * @returns {boolean} - Whether the error should be retried
 */
export function shouldRetryError(error) {
  // Network errors (no response)
  if (!error.response) {
    return true; // Retry network errors
  }

  const status = error.response.status;

  // Retry on server errors (5xx)
  if (status >= 500 && status < 600) {
    return true;
  }

  // Retry on rate limiting (429)
  if (status === 429) {
    return true;
  }

  // Retry on gateway timeout (504)
  if (status === 504) {
    return true;
  }

  // Don't retry on client errors (4xx except 429)
  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} - Delay in milliseconds
 */
export function calculateDelay(attempt, baseDelay = 1000, maxDelay = 30000) {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter (±25% random variation to avoid thundering herd)
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  const delay = Math.min(exponentialDelay + jitter, maxDelay);
  
  // For rate limit errors (429), respect Retry-After header if present
  return Math.max(100, delay); // Minimum 100ms
}

/**
 * Get retry delay from error response headers (for 429 rate limits)
 * @param {Error} error - The error object
 * @returns {number|null} - Delay in milliseconds, or null if not specified
 */
export function getRetryAfterDelay(error) {
  if (error.response?.headers?.['retry-after']) {
    const retryAfter = parseInt(error.response.headers['retry-after'], 10);
    // Convert to milliseconds if in seconds
    return retryAfter > 60 ? retryAfter : retryAfter * 1000;
  }
  return null;
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 30000)
 * @param {Function} options.shouldRetry - Custom retry predicate (default: shouldRetryError)
 * @param {Function} options.onRetry - Callback called before each retry (attempt, error, delay)
 * @returns {Promise} - Promise that resolves with the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
    onRetry?: ((attempt: number, error: unknown, delay: number) => void) | null;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = shouldRetryError,
    onRetry = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted retries
      if (attempt >= maxRetries) {
        break;
      }

      // Don't retry if error shouldn't be retried
      if (!shouldRetry(error)) {
        throw error;
      }

      // Calculate delay (respect Retry-After header for 429)
      let delay = getRetryAfterDelay(error);
      if (!delay) {
        delay = calculateDelay(attempt, baseDelay, maxDelay);
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error, delay);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Create a retry wrapper for API calls
 * @param {Function} apiCall - The API call function
 * @param {Object} retryOptions - Retry options (same as retryWithBackoff)
 * @returns {Function} - Wrapped function with retry logic
 */
export function withRetry(apiCall, retryOptions = {}) {
  return async (...args) => {
    return retryWithBackoff(() => apiCall(...args), retryOptions);
  };
}