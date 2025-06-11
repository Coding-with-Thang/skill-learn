import axios from "axios";

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
const MAX_RETRIES = 3;

// Cache configuration
const cache = new Map();
const cacheDurations = {
  "/api/categories": 60 * 60 * 1000, // 1 hour
  "/api/user/rewards": 5 * 60 * 1000, // 5 minutes
  "/api/user/points": 1 * 60 * 1000, // 1 minute
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
      const cacheDuration = cacheDurations[config.url] || 5 * 60 * 1000;

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
      const retryAfter = response.data.retryAfter || 60;
      const retryKey = config.url;
      const retryTime = Date.now() + retryAfter * 1000;
      retryDelays.set(retryKey, retryTime);

      // If we haven't retried too many times, retry after backoff
      if (config.retryCount < MAX_RETRIES) {
        config.retryCount = (config.retryCount || 0) + 1;
        const backoff = Math.min(1000 * Math.pow(2, config.retryCount), 30000);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

// Export the api instance
export default api;
