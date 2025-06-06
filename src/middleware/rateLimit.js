"use server";

// Simple in-memory rate limiter with sliding window
const requests = new Map();
const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requests.entries()) {
    if (now - value.timestamp >= CLEANUP_INTERVAL) {
      requests.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export const rateLimiter = async (ip, options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
  } = options;

  const now = Date.now();
  const key = ip;
  const record = requests.get(key) || {
    count: 0,
    timestamp: now,
    history: [], // Keep track of request timestamps
  };

  // Clean up old requests from history
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
