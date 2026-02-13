# Constants Usage Guide

**Date:** January 2025  
**Purpose:** Document constants usage, configuration, and best practices

---

## Overview

Magic numbers and hardcoded values are centralized in `apps/lms/config/constants.ts` for better maintainability.

---

## Available Constants

### Score Thresholds

```typescript
import { SCORE_THRESHOLDS } from "@/config/constants";

// Usage
if (score >= SCORE_THRESHOLDS.EXCELLENT) {
  // 90 or above
} else if (score >= SCORE_THRESHOLDS.GOOD) {
  // 80-89
} else if (score >= SCORE_THRESHOLDS.PASSING) {
  // 70-79
} else if (score >= SCORE_THRESHOLDS.WARNING) {
  // 60-69
}
```

**Values:**

- `EXCELLENT`: 90
- `GOOD`: 80
- `PASSING`: 70
- `WARNING`: 60

**Used in:**

- `apps/lms/components/user/QuizStats.tsx`
- `apps/lms/components/user/UserStats.tsx`

---

### Cache Durations

```typescript
import { CACHE_DURATIONS } from "@/config/constants";

// Usage
const cacheDuration = CACHE_DURATIONS.CATEGORIES; // 1 hour
```

**Values (milliseconds):**

- `CATEGORIES`: 60 × 60 × 1000 (1 hour)
- `REWARDS`: 5 × 60 × 1000 (5 minutes)
- `POINTS`: 1 × 60 × 1000 (1 minute)
- `DEFAULT`: 5 × 60 × 1000 (5 minutes)

**Used in:**

- API configuration in `@skill-learn/lib`

---

### Retry Configuration

```javascript
import { RETRY_CONFIG } from "@/config/constants";

// Usage
if (retryCount < RETRY_CONFIG.MAX_RETRIES) {
  const delay = RETRY_CONFIG.BACKOFF_BASE * retryCount;
}
```

**Values:**

- `MAX_RETRIES`: 3
- `DEFAULT_RETRY_AFTER`: 60 (seconds)
- `BACKOFF_BASE`: 1000 (milliseconds)
- `BACKOFF_MAX`: 30000 (milliseconds)
- `ROLE_FETCH_MAX_RETRIES`: 3
- `ROLE_FETCH_BACKOFF_BASE`: 1000 (milliseconds)

**Used in:**

- API configuration and role hooks in `@skill-learn/lib`

---

### Rate Limiting

```javascript
import { RATE_LIMIT } from "@/config/constants";

// Usage
const windowMs = RATE_LIMIT.WINDOW_MS;
const maxRequests = RATE_LIMIT.MAX_REQUESTS;
```

**Values (milliseconds):**

- `CLEANUP_INTERVAL`: 15 _ 60 _ 1000 (15 minutes)
- `WINDOW_MS`: 15 _ 60 _ 1000 (15 minutes)
- `MAX_REQUESTS`: 100

**Used in:**

- Rate limiting utilities in `@skill-learn/lib`

---

### Animation

```javascript
import { ANIMATION } from "@/config/constants";

// Usage
const duration = ANIMATION.DURATION_MS;
const steps = ANIMATION.STEPS;
```

**Values:**

- `DURATION_MS`: 1000 (1 second)
- `STEPS`: 30

**Used in:**

- `apps/lms/components/user/PointsRewardsWidget.tsx`

---

### UI Constants

```javascript
import { UI } from "@/config/constants";

// Usage
const maxPercentage = UI.MAX_PERCENTAGE;
const dots = Array(UI.STREAK_DISPLAY_DOTS);
```

**Values:**

- `MAX_PERCENTAGE`: 100
- `STREAK_DISPLAY_DOTS`: 5
- `PROGRESS_BAR_MAX`: 100
- `TRANSITION_DURATION_MS`: 1000 (1 second)

**Used in:**

- `apps/lms/app/(lms)/(user)/quiz/page.tsx`
- `apps/lms/app/(lms)/(user)/rewards/page.tsx`
- `apps/lms/components/user/UserStats.tsx`
- `apps/lms/components/user/PointsRewardsWidget.tsx`

---

### Store Configuration

```javascript
import { STORE } from "@/config/constants";

// Usage
const cooldown = STORE.FETCH_COOLDOWN;
```

**Values (milliseconds):**

- `FETCH_COOLDOWN`: 5000 (5 seconds)

**Used in:**

- `@skill-learn/lib/stores/pointsStore`

---

### Quiz Configuration

```javascript
import { QUIZ_CONFIG } from "@/config/constants";

// Usage
const defaultPassingScore = QUIZ_CONFIG.DEFAULT_PASSING_SCORE;
const pointsPerAnswer = QUIZ_CONFIG.POINTS_PER_CORRECT_ANSWER;
```

**Values:**

- `DEFAULT_PASSING_SCORE`: 70 (percentage)
- `POINTS_PER_CORRECT_ANSWER`: 1000
- `DEFAULT_QUESTIONS_COUNT`: 5

**Used in:**

- `apps/lms/components/admin/QuizBuilder.tsx`
- `apps/lms/app/(lms)/(user)/quiz/page.tsx`
- `apps/lms/app/api/admin/quizzes/route.ts`

**Note:** These values should match `DEFAULT_SETTINGS` in `apps/lms/lib/actions/settings.ts`:

- `DEFAULT_PASSING_SCORE` should match `DEFAULT_SETTINGS.DEFAULT_PASSING_SCORE`
- `POINTS_PER_CORRECT_ANSWER` should match `DEFAULT_SETTINGS.POINTS_FOR_PASSING_QUIZ`

---

### File Upload Configuration

```javascript
import { FILE_UPLOAD } from "@/config/constants";

// Usage
const expiresAt =
  Date.now() + FILE_UPLOAD.URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
```

**Values:**

- `URL_EXPIRY_DAYS`: 7

**Used in:**

- `apps/lms/app/api/admin/upload/route.ts`
- `apps/lms/app/api/admin/courses/upload/route.ts`

---

## Constants That Should Be Configurable via System Settings

The following constants should ideally be configurable via system settings (stored in database) rather than hardcoded:

### High Priority (Business Logic)

1. **`QUIZ_CONFIG.DEFAULT_PASSING_SCORE`**

   - **Current:** 70
   - **System Setting:** `DEFAULT_PASSING_SCORE`
   - **Status:** ✅ Already configurable via system settings
   - **Recommendation:** Use system setting value instead of constant when available

2. **`QUIZ_CONFIG.POINTS_PER_CORRECT_ANSWER`**

   - **Current:** 1000
   - **System Setting:** `POINTS_FOR_PASSING_QUIZ`
   - **Status:** ✅ Already configurable via system settings
   - **Recommendation:** Use system setting value instead of constant when available

3. **`SCORE_THRESHOLDS`** (EXCELLENT, GOOD, PASSING, WARNING)
   - **Current:** 90, 80, 70, 60
   - **System Setting:** Not yet configurable
   - **Recommendation:** Consider making these configurable if business requirements change

### Medium Priority (Performance Tuning)

4. **`CACHE_DURATIONS`**

   - **Current:** Various (1 hour, 5 minutes, 1 minute)
   - **System Setting:** Not yet configurable
   - **Recommendation:** Could be made configurable for performance tuning

5. **`RATE_LIMIT`**
   - **Current:** 15 minutes, 100 requests
   - **System Setting:** Not yet configurable
   - **Recommendation:** Could be made configurable for security tuning

### Low Priority (UI/UX)

6. **`ANIMATION.DURATION_MS`**

   - **Current:** 1000ms
   - **System Setting:** Not configurable
   - **Recommendation:** Low priority, cosmetic only

7. **`UI.TRANSITION_DURATION_MS`**
   - **Current:** 1000ms
   - **System Setting:** Not configurable
   - **Recommendation:** Low priority, cosmetic only

---

## Best Practices

### 1. Always Import Constants

✅ **Good:**

```typescript
import { SCORE_THRESHOLDS } from "@/config/constants";

if (score >= SCORE_THRESHOLDS.PASSING) {
  // ...
}
```

❌ **Bad:**

```javascript
if (score >= 70) {
  // ...
}
```

### 2. Use System Settings When Available

✅ **Good:**

```javascript
import { getSystemSetting } from "@/lib/actions/settings";
import { QUIZ_CONFIG } from "@/config/constants";

// Try to get from system settings first, fallback to constant
const passingScore =
  parseInt(await getSystemSetting("DEFAULT_PASSING_SCORE"), 10) ||
  QUIZ_CONFIG.DEFAULT_PASSING_SCORE;
```

❌ **Bad:**

```javascript
const passingScore = 70; // Hardcoded
```

### 3. Document New Constants

When adding new constants:

1. Add to `apps/lms/config/constants.ts`
2. Update this documentation
3. Add JSDoc comments explaining the constant's purpose
4. Consider if it should be configurable via system settings

### 4. Group Related Constants

Constants are grouped by domain:

- `SCORE_THRESHOLDS` - Score-related
- `CACHE_DURATIONS` - Caching-related
- `RETRY_CONFIG` - Retry logic
- `RATE_LIMIT` - Rate limiting
- `ANIMATION` - Animation timing
- `UI` - UI display values
- `STORE` - Store configuration
- `QUIZ_CONFIG` - Quiz-specific
- `FILE_UPLOAD` - File upload settings

---

## Migration Checklist

When extracting magic numbers to constants:

- [ ] Add constant to `apps/lms/config/constants.ts`
- [ ] Replace all hardcoded values with constant
- [ ] Update imports in affected files
- [ ] Verify no linter errors
- [ ] Test affected functionality
- [ ] Update this documentation
- [ ] Consider if constant should be configurable via system settings

---

## Future Improvements

1. **Create helper function for system settings with fallback:**

   ```javascript
   async function getSettingOrConstant(settingKey, constantValue) {
     try {
       const setting = await getSystemSetting(settingKey);
       return setting ? parseInt(setting, 10) : constantValue;
     } catch {
       return constantValue;
     }
   }
   ```

2. **Add TypeScript types** (if migrating to TypeScript):

   ```typescript
   export const SCORE_THRESHOLDS = {
     EXCELLENT: 90,
     // ...
   } as const;
   ```

3. **Environment-based overrides:**
   - Allow some constants to be overridden via environment variables
   - Useful for different environments (dev, staging, prod)

---

**Last Updated:** January 2025
