// Score Thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  PASSING: 70,
  WARNING: 60,
};

// Cache Durations (milliseconds)
export const CACHE_DURATIONS = {
  CATEGORIES: 60 * 60 * 1000, // 1 hour
  REWARDS: 5 * 60 * 1000, // 5 minutes
  POINTS: 1 * 60 * 1000, // 1 minute
  DEFAULT: 5 * 60 * 1000, // 5 minutes
};

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  DEFAULT_RETRY_AFTER: 60, // seconds
  BACKOFF_BASE: 1000, // milliseconds
  BACKOFF_MAX: 30000, // milliseconds
  ROLE_FETCH_MAX_RETRIES: 3,
  ROLE_FETCH_BACKOFF_BASE: 1000,
};

// Rate Limiting
export const RATE_LIMIT = {
  CLEANUP_INTERVAL: 15 * 60 * 1000, // 15 minutes
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
};

// Animation
export const ANIMATION = {
  DURATION_MS: 1000,
  STEPS: 30,
};

// UI Constants
export const UI = {
  MAX_PERCENTAGE: 100,
  STREAK_DISPLAY_DOTS: 5,
  PROGRESS_BAR_MAX: 100,
};

// Store Configuration
export const STORE = {
  FETCH_COOLDOWN: 5000, // 5 seconds
};


