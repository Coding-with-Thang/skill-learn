import axios from "axios";

// Create an axios instance with defaults
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add caching interceptor
const cache = new Map();

api.interceptors.request.use((config) => {
  if (config.method === "get") {
    const key = `${config.url}${JSON.stringify(config.params || {})}`;
    const cachedResponse = cache.get(key);

    // Add cache duration configuration per endpoint
    const cacheDuration =
      {
        "/api/categories": 60 * 60 * 1000, // 1 hour
        "/api/user/rewards": 5 * 60 * 1000, // 5 minutes
        "/api/user/points": 1 * 60 * 1000, // 1 minute
      }[config.url] || 5 * 60 * 1000; // default 5 minutes

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
});

api.interceptors.response.use(
  (response) => {
    if (response.config.method === "get") {
      const key = `${response.config.url}${JSON.stringify(
        response.config.params || {}
      )}`;
      cache.set(key, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 304) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  }
);

export default api;
