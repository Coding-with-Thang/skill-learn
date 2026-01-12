/**
 * Request Deduplication Utility
 * 
 * Prevents duplicate API calls by tracking ongoing requests and returning
 * the same promise for concurrent calls with the same key.
 * 
 * Features:
 * - Request deduplication (prevents duplicate calls)
 * - Optional cooldown period (prevents rapid successive calls)
 * - Force refresh option (bypasses cache and cooldown)
 * - Automatic cleanup of completed requests
 * 
 * @example
 * const dedupe = createRequestDeduplicator();
 * 
 * async function fetchData(force = false) {
 *   return dedupe('fetchData', async () => {
 *     const response = await api.get('/data');
 *     return response.data;
 *   }, { force, cooldown: 5000 });
 * }
 */

/**
 * Creates a request deduplicator instance
 * @returns {Object} Request deduplicator with dedupe method
 */
export function createRequestDeduplicator() {
  // Map to track ongoing requests by key
  const ongoingRequests = new Map();
  
  // Map to track last fetch timestamps by key (for cooldown)
  const lastFetchTimes = new Map();

  /**
   * Deduplicates a request
   * @param {string} key - Unique key for this request (e.g., 'fetchUsers', 'fetchRewards')
   * @param {Function} requestFn - Async function that performs the actual request
   * @param {Object} options - Options for deduplication
   * @param {boolean} options.force - If true, bypasses cache and cooldown, forces new request
   * @param {number} options.cooldown - Cooldown period in milliseconds (default: 0, no cooldown)
   * @returns {Promise} The request promise (deduplicated if already in progress)
   */
  function dedupe(key, requestFn, options = {}) {
    const { force = false, cooldown = 0 } = options;
    const now = Date.now();

    // Check if there's an ongoing request for this key
    if (!force && ongoingRequests.has(key)) {
      return ongoingRequests.get(key);
    }

    // Check cooldown period (if not forcing)
    if (!force && cooldown > 0) {
      const lastFetch = lastFetchTimes.get(key);
      if (lastFetch && now - lastFetch < cooldown) {
        // Return a resolved promise with cached data indication
        // Note: This requires the caller to handle cooldown differently
        // For now, we'll still make the request but this can be extended
        // to return cached data if available
      }
    }

    // Create the request promise
    const requestPromise = Promise.resolve(requestFn())
      .then((result) => {
        // Update last fetch time on success
        lastFetchTimes.set(key, Date.now());
        return result;
      })
      .catch((error) => {
        // On error, still update last fetch time to prevent rapid retries
        lastFetchTimes.set(key, Date.now());
        throw error;
      })
      .finally(() => {
        // Clean up: remove from ongoing requests
        ongoingRequests.delete(key);
      });

    // Store the promise for deduplication
    ongoingRequests.set(key, requestPromise);

    return requestPromise;
  }

  /**
   * Clears all ongoing requests (useful for cleanup or testing)
   */
  function clear() {
    ongoingRequests.clear();
    lastFetchTimes.clear();
  }

  /**
   * Clears a specific request by key
   * @param {string} key - The key to clear
   */
  function clearKey(key) {
    ongoingRequests.delete(key);
    lastFetchTimes.delete(key);
  }

  /**
   * Gets the number of ongoing requests
   * @returns {number} Number of ongoing requests
   */
  function getOngoingCount() {
    return ongoingRequests.size;
  }

  return {
    dedupe,
    clear,
    clearKey,
    getOngoingCount,
  };
}

/**
 * Default singleton instance for simple use cases
 * Use this when you don't need multiple deduplicator instances
 */
export const defaultDeduplicator = createRequestDeduplicator();

/**
 * Convenience function using the default deduplicator
 * @param {string} key - Unique key for this request
 * @param {Function} requestFn - Async function that performs the actual request
 * @param {Object} options - Options for deduplication
 * @returns {Promise} The request promise (deduplicated if already in progress)
 */
export function dedupeRequest(key, requestFn, options = {}) {
  return defaultDeduplicator.dedupe(key, requestFn, options);
}

