# Magic Numbers & Hardcoded Values Audit

## Summary

This document identifies all magic numbers, hardcoded values, and thresholds that should be extracted into constants for better maintainability and configurability.

---

## 🔴 HIGH PRIORITY - Score Thresholds

### QuizStats.jsx (Lines 122-124)

**Issue:** Hardcoded score thresholds for color coding

```javascript
quiz.bestScore >= 90
  ? "bg-green-100 text-green-800"
  : quiz.bestScore >= 70
  ? "bg-yellow-100 text-yellow-800"
  : "bg-red-100 text-red-800";
```

**Recommendation:** Extract to constants:

- `EXCELLENT_SCORE_THRESHOLD = 90`
- `PASSING_SCORE_THRESHOLD = 70`

### UserStats.jsx (Line 185)

**Issue:** Hardcoded thresholds for progress bar variants

```javascript
(category.averageScore || 0) >= 80
  ? "success"
  : (category.averageScore || 0) >= 60
  ? "warning"
  : "error";
```

**Recommendation:** Extract to constants:

- `EXCELLENT_AVERAGE_THRESHOLD = 80`
- `PASSING_AVERAGE_THRESHOLD = 60`

### Multiple Files - Default Passing Score

**Issue:** Hardcoded `70` as default passing score in multiple places:

- `src/app/api/admin/quizzes/route.js` (line 64): `passingScore: data.passingScore || 70`
- `src/app/api/admin/quizzes/[quizId]/route.js` (line 68): `passingScore: data.passingScore || 70`
- `src/app/api/quiz/settings/route.js` (line 11): `passingScoreDefault: 70`
- `src/components/features/admin/QuizBuilder.jsx` (line 40): `passingScore: 70`
- `prisma/schema.prisma` (line 75): `passingScore Int @default(70)`

**Note:** This is already in `DEFAULT_SETTINGS.DEFAULT_PASSING_SCORE` but not consistently used.

---

## 🟡 MEDIUM PRIORITY - Time Durations & Intervals

### axios.js (Lines 29, 33-37, 68, 125, 133)

**Issue:** Hardcoded cache durations and retry values

```javascript
const MAX_RETRIES = 3;
const cacheDurations = {
  "/api/categories": 60 * 60 * 1000, // 1 hour
  "/api/user/rewards": 5 * 60 * 1000, // 5 minutes
  "/api/user/points": 1 * 60 * 1000, // 1 minute
};
const cacheDuration = cacheDurations[config.url] || 5 * 60 * 1000; // Default 5 minutes
const retryAfter = response.data.retryAfter || 60; // Default 60 seconds
const backoff = Math.min(1000 * Math.pow(2, config.retryCount), 30000); // Max 30 seconds
```

**Recommendation:** Extract to constants:

- `CACHE_DURATION_CATEGORIES = 60 * 60 * 1000`
- `CACHE_DURATION_REWARDS = 5 * 60 * 1000`
- `CACHE_DURATION_POINTS = 1 * 60 * 1000`
- `CACHE_DURATION_DEFAULT = 5 * 60 * 1000`
- `MAX_RETRIES = 3`
- `RETRY_AFTER_DEFAULT = 60`
- `BACKOFF_MAX_DELAY = 30000`

### pointsStore.js (Line 6)

**Issue:** Hardcoded fetch cooldown

```javascript
const FETCH_COOLDOWN = 5000; // 5 seconds
```

**Recommendation:** Extract to constant (already done, but could be configurable)

### useUserRole.js (Lines 56, 64)

**Issue:** Hardcoded retry count and backoff

```javascript
retryCountRef.current < 3;
1000 * retryCountRef.current; // Exponential backoff
```

**Recommendation:** Extract to constants:

- `MAX_ROLE_FETCH_RETRIES = 3`
- `ROLE_FETCH_BACKOFF_BASE = 1000`

### rateLimit.js (Lines 6, 10-11)

**Issue:** Hardcoded rate limit values

```javascript
const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
windowMs = 15 * 60 * 1000, // 15 minutes
max = 100, // Limit each IP to 100 requests per windowMs
```

**Recommendation:** Extract to constants:

- `RATE_LIMIT_CLEANUP_INTERVAL = 15 * 60 * 1000`
- `RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000`
- `RATE_LIMIT_MAX_REQUESTS = 100`

### PointsRewardsWidget.jsx (Lines 53-55)

**Issue:** Hardcoded animation duration and steps

```javascript
const duration = 1000; // 1 second
const steps = 30;
const stepDuration = duration / steps;
```

**Recommendation:** Extract to constants:

- `ANIMATION_DURATION_MS = 1000`
- `ANIMATION_STEPS = 30`

---

## 🟢 LOW PRIORITY - UI & Display Values

### rewards/page.jsx (Line 75)

**Issue:** Hardcoded transition duration

```javascript
duration - 1000;
```

**Recommendation:** Use CSS variable or constant

### Multiple Files - Percentage Calculations

**Issue:** Hardcoded `100` in percentage calculations

- `src/app/quiz/page.jsx` (line 222): `Math.max(0, Math.min(100, ...))`
- `src/components/features/user/PointsRewardsWidget.jsx` (line 143): `Math.min(progressPercentage, 100)`
- `src/app/rewards/page.jsx` (line 53): `Math.min(100, ...)`

**Recommendation:** Extract to constant:

- `MAX_PERCENTAGE = 100`

### Multiple Files - Array Lengths & Counts

**Issue:** Hardcoded array lengths and counts

- `src/app/rewards/page.jsx` (line 98): `[...Array(5)]` - Streak display dots
- `src/components/features/user/UserStats.jsx` (line 184): `max={100}` - Progress bar max

**Recommendation:** Extract to constants:

- `STREAK_DISPLAY_DOTS = 5`
- `PROGRESS_BAR_MAX = 100`

---

## 📋 RECOMMENDED CONSTANTS FILE STRUCTURE

Create `src/constants/index.js`:

```javascript
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
  TRANSITION_DURATION_MS: 1000,
};

// Store Configuration
export const STORE = {
  FETCH_COOLDOWN: 5000, // 5 seconds
};
```

---

## 🔧 IMPLEMENTATION PRIORITY

1. **Immediate:** Score thresholds in QuizStats and UserStats (affects user experience)
2. **High:** Cache durations in axios.js (affects performance)
3. **Medium:** Retry configurations (affects reliability)
4. **Low:** UI constants (cosmetic)

---

## 📝 NOTES

- Some values are already in `DEFAULT_SETTINGS` but not consistently used across the codebase
- Consider making some constants configurable via environment variables or system settings
- Review and consolidate duplicate constants (e.g., passing score appears in multiple places)
