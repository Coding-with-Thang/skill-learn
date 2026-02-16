/**
 * API Response Parser Utility
 * Standardizes parsing of API responses across the application
 * 
 * Handles both standardized format: { success: true, data: T }
 * and provides fallback for legacy formats during migration
 */

/**
 * Extract data from API response
 * Standard format: { success: true, data: T }
 * Legacy formats are handled for backward compatibility
 * 
 * @param {Object} response - Axios response object
 * @param {string} [key] - Optional key to extract from data object (e.g., 'categories', 'rewards')
 * @returns {*} The extracted data
 * 
 * @example
 * // Standardized response
 * const response = await api.get('/categories');
 * const categories = parseApiResponse(response, 'categories');
 * 
 * @example
 * // Direct data access
 * const response = await api.get('/user/stats');
 * const stats = parseApiResponse(response);
 */
type AxiosLikeResponse = { data?: { success?: boolean; data?: unknown; [key: string]: unknown } };

export function parseApiResponse(response: unknown, key: string | null = null): unknown {
  const res = response as AxiosLikeResponse;
  if (!res?.data) {
    throw new Error("Invalid response: missing data");
  }

  // Check for standardized format: { success: true, data: T }
  if (res.data.success !== undefined && res.data.data !== undefined) {
    const data = res.data.data as Record<string, unknown>;
    if (key) {
      return data[key] ?? data;
    }
    return data;
  }

  // Legacy format handling (for backward compatibility during migration)
  if (key && res.data[key]) {
    return res.data[key];
  }
  if (Array.isArray(res.data) || (typeof res.data === "object" && res.data !== null)) {
    return res.data;
  }
  return res.data;
}

/**
 * Check if API response is successful
 * @param {Object} response - Axios response object
 * @returns {boolean} True if response indicates success
 */
export function isApiResponseSuccess(response) {
  if (!response?.data) {
    return false;
  }
  
  // Standardized format
  if (response.data.success !== undefined) {
    return response.data.success === true;
  }
  
  // Legacy: assume success if no error field
  return !response.data.error;
}

type ErrorWithResponse = {
  response?: { data?: { error?: string; message?: string } };
  message?: string;
};

/**
 * Extract error message from API response
 * @param error - Error object (from catch block)
 * @returns Error message
 */
export function parseApiError(error: unknown): string {
  const err = error as ErrorWithResponse;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err?.message === "string") return err.message;
  return "An unexpected error occurred";
}

