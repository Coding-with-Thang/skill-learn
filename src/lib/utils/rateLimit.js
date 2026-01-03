// Simple in-memory rate limiter with sliding window
// Note: This runs in Edge runtime (middleware), so we cannot use setInterval
// Cleanup happens automatically when checking requests (lazy cleanup)
// For production, consider using a shared cache like Redis or Upstash
import { RATE_LIMIT } from "@/constants";

const requests = new Map();

export const rateLimiter = async (ip, options = {}) => {
  const {
    windowMs = RATE_LIMIT.WINDOW_MS,
    max = RATE_LIMIT.MAX_REQUESTS,
  } = options;

  const now = Date.now();
  const key = ip;
  let record = requests.get(key);

  // Cleanup: Remove old entries that are beyond the cleanup interval
  // This is a lazy cleanup that happens during request processing
  if (record && now - record.timestamp >= RATE_LIMIT.CLEANUP_INTERVAL) {
    requests.delete(key);
    record = null;
  }

  // Initialize record if it doesn't exist
  if (!record) {
    record = {
      count: 0,
      timestamp: now,
      history: [], // Keep track of request timestamps
    };
  }

  // Clean up old requests from history (sliding window)
  record.history = record.history.filter((time) => now - time < windowMs);

  // Add current request
  record.history.push(now);
  record.count = record.history.length;
  record.timestamp = now;

  requests.set(key, record);

  // Calculate time until next window
  const oldestRequest = record.history[0] || now;
  const windowExpiry = oldestRequest + windowMs;
  const timeUntilReset = Math.max(0, windowExpiry - now);

  return {
    success: record.count <= max,
    remaining: Math.max(0, max - record.count),
    retryAfter: record.count > max ? Math.ceil(timeUntilReset / 1000) : 0,
  };
};
