/**
 * API Response Adapter
 * 
 * Temporarily handles both old and new API response formats during migration.
 * This allows gradual migration without breaking existing code.
 * 
 * Once all routes are migrated to standardized format, this adapter can be removed.
 * 
 * @param {Object} response - Axios response object
 * @param {string} endpoint - The API endpoint (for logging/debugging)
 * @returns {any} The data from the response (normalized to standard format)
 * 
 * @example
 * const response = await api.get('/categories');
 * const data = getResponseData(response);
 * // data.categories is now always available regardless of format
 */
export function getResponseData(response, endpoint = '') {
  const responseData = response?.data;

  if (!responseData) {
    console.warn(`[apiResponseAdapter] No data in response for ${endpoint}`);
    return null;
  }

  // Handle standardized format: { success: true, data: {...} }
  if (responseData.success === true && responseData.data !== undefined) {
    return responseData.data;
  }

  // Handle legacy formats (will be removed after migration)
  
  // Legacy format: { categories: [...] }
  if (responseData.categories !== undefined) {
    return { categories: responseData.categories };
  }

  // Legacy format: { rewards: [...] }
  if (responseData.rewards !== undefined) {
    return { rewards: responseData.rewards };
  }

  // Legacy format: { leaderboard: [...] }
  if (responseData.leaderboard !== undefined) {
    return { leaderboard: responseData.leaderboard };
  }

  // Legacy format: Direct array (admin routes)
  if (Array.isArray(responseData)) {
    return responseData;
  }

  // Legacy format: Direct object (user, settings, etc.)
  // Return as-is for now (these will be migrated to wrapped format)
  return responseData;
}

/**
 * Extract a specific field from API response
 * Useful for accessing nested data during migration
 * 
 * @param {Object} response - Axios response object
 * @param {string} field - Field name to extract
 * @returns {any} The field value or null
 * 
 * @example
 * const categories = extractField(response, 'categories');
 */
export function extractField(response, field) {
  const data = getResponseData(response);
  
  // Handle nested object
  if (data && typeof data === 'object' && field in data) {
    return data[field];
  }
  
  // Handle direct array/object response
  if (Array.isArray(data) && field === 'data') {
    return data;
  }
  
  return data?.[field] ?? null;
}

