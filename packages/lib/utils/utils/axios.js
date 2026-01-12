import axios from "axios";

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  CATEGORIES: 60 * 60 * 1000, // 1 hour
  REWARDS: 5 * 60 * 1000, // 5 minutes
  POINTS: 1 * 60 * 1000, // 1 minute
  DEFAULT: 5 * 60 * 1000, // 5 minutes
};

// Retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  DEFAULT_RETRY_AFTER: 60, // seconds
  BACKOFF_BASE: 1000, // milliseconds
  BACKOFF_MAX: 30000, // milliseconds
};

// Create an axios instance with defaults
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for handling auth cookies
});

// Add auth header to every request
api.interceptors.request.use(async (config) => {
  try {
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error("Error adding auth header:", error);
  }
  return config;
});

// Rate limiting management
const retryDelays = new Map();

// Cache configuration
const cache = new Map();
const cacheDurations = {
  "/api/categories": CACHE_DURATIONS.CATEGORIES,
  "/api/user/rewards": CACHE_DURATIONS.REWARDS,
  "/api/user/points": CACHE_DURATIONS.POINTS,
};

// Remove any double /api prefixes from URLs
api.interceptors.request.use(
  (config) => {
    // Clean up URL
    config.url = config.url.replace(/^\/api\/api\//, "/api/");

    // Add retry count to config
    config.retryCount = config.retryCount || 0;

    // Check if we need to wait due to rate limiting
    const retryKey = config.url;
    const retryAfter = retryDelays.get(retryKey);
    if (retryAfter && Date.now() < retryAfter) {
      return Promise.reject({
        config,
        response: {
          status: 429,
          data: {
            error: "Rate limited",
            retryAfter: Math.ceil((retryAfter - Date.now()) / 1000),
          },
        },
      });
    }

    // Check cache for GET requests
    if (config.method === "get") {
      const key = `${config.url}${JSON.stringify(config.params || {})}`;
      const cachedResponse = cache.get(key);
      const cacheDuration =
        cacheDurations[config.url] || CACHE_DURATIONS.DEFAULT;

      if (
        cachedResponse &&
        Date.now() - cachedResponse.timestamp < cacheDuration
      ) {
        return Promise.reject({
          config,
          response: { data: cachedResponse.data, status: 304 },
        });
      }
      cache.delete(key);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === "get") {
      const key = `${response.config.url}${JSON.stringify(
        response.config.params || {}
      )}`;
      cache.set(key, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    // Clear rate limiting delay if request succeeded
    retryDelays.delete(response.config.url);

    return response;
  },
  async (error) => {
    const { config, response } = error; // Return cached responses
    if (response?.status === 304) {
      return Promise.resolve(response);
    }

    // Handle auth errors
    if (response?.status === 401) {
      // Clear any stale auth state
      window.Clerk?.session?.end();

      // Don't redirect if we're already on the sign-in page
      if (!window.location.pathname.startsWith("/sign-in")) {
        window.location.href = "/sign-in";
      }
    }

    // Handle rate limiting
    if (response?.status === 429) {
      const retryAfter =
        response.data.retryAfter || RETRY_CONFIG.DEFAULT_RETRY_AFTER;
      const retryKey = config.url;
      const retryTime = Date.now() + retryAfter * 1000;
      retryDelays.set(retryKey, retryTime);

      // If we haven't retried too many times, retry after backoff
      if (config.retryCount < RETRY_CONFIG.MAX_RETRIES) {
        config.retryCount = (config.retryCount || 0) + 1;
        const backoff = Math.min(
          RETRY_CONFIG.BACKOFF_BASE * Math.pow(2, config.retryCount),
          RETRY_CONFIG.BACKOFF_MAX
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

// Export the api instance
export default api;
