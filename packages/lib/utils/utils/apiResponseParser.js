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
export function parseApiResponse(response, key = null) {
  if (!response?.data) {
    throw new Error("Invalid response: missing data");
  }

  // Check for standardized format: { success: true, data: T }
  if (response.data.success !== undefined && response.data.data !== undefined) {
    const data = response.data.data;
    
    // If a key is specified, extract it from the data object
    if (key) {
      return data[key] ?? data;
    }
    
    return data;
  }

  // Legacy format handling (for backward compatibility during migration)
  // Remove these once all routes are migrated
  
  // Legacy: { categories: [...] }, { rewards: [...] }, etc.
  if (key && response.data[key]) {
    return response.data[key];
  }
  
  // Legacy: Direct array or object
  if (Array.isArray(response.data) || (typeof response.data === 'object' && response.data !== null)) {
    return response.data;
  }

  // Fallback: return the entire response.data
  return response.data;
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

/**
 * Extract error message from API response
 * @param {Object} error - Error object (from catch block)
 * @returns {string} Error message
 */
export function parseApiError(error) {
  // Standardized error format
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Standardized error format (alternative)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Generic error
  return error?.message || "An unexpected error occurred";
}

