# Request Deduplication Guide

**Date:** January 2025  
**Purpose:** Document the request deduplication utility and its usage across stores

---

## Overview

The request deduplication utility prevents duplicate API calls by tracking ongoing requests and returning the same promise for concurrent calls with the same key. This reduces unnecessary network traffic and improves performance.

---

## Utility Location

**File:** `src/utils/requestDeduplication.js`

---

## Features

1. **Request Deduplication** - Prevents duplicate calls by tracking ongoing requests
2. **Optional Cooldown** - Prevents rapid successive calls within a time window
3. **Force Refresh** - Bypasses cache and cooldown to force a new request
4. **Automatic Cleanup** - Removes completed requests from tracking
5. **Multiple Instances** - Supports multiple deduplicator instances if needed

---

## API

### `createRequestDeduplicator()`

Creates a new request deduplicator instance.

```javascript
import { createRequestDeduplicator } from "@/utils/requestDeduplication";

const deduplicator = createRequestDeduplicator();
```

### `dedupe(key, requestFn, options)`

Deduplicates a request.

**Parameters:**
- `key` (string) - Unique key for this request (e.g., 'fetchUsers', 'fetchRewards')
- `requestFn` (Function) - Async function that performs the actual request
- `options` (Object) - Optional configuration
  - `force` (boolean) - If true, bypasses cache and cooldown, forces new request (default: false)
  - `cooldown` (number) - Cooldown period in milliseconds (default: 0, no cooldown)

**Returns:** Promise - The request promise (deduplicated if already in progress)

**Example:**
```javascript
const deduplicator = createRequestDeduplicator();

async function fetchUsers(force = false) {
  return deduplicator.dedupe(
    'fetchUsers',
    async () => {
      const response = await api.get('/users');
      return response.data;
    },
    { force, cooldown: 5000 }
  );
}
```

### Convenience Function: `dedupeRequest(key, requestFn, options)`

Uses the default singleton instance for simple use cases.

```javascript
import { dedupeRequest } from "@/utils/requestDeduplication";

async function fetchData() {
  return dedupeRequest('fetchData', async () => {
    return await api.get('/data');
  });
}
```

---

## Implementation in Stores

### Points Store

**File:** `src/app/store/pointsStore.js`

**Implementation:**
```javascript
import { createRequestDeduplicator } from "@/utils/requestDeduplication";
import { STORE } from "@/constants";

const requestDeduplicator = createRequestDeduplicator();

fetchUserData: async (force = false) => {
  // ... cooldown check ...
  
  return requestDeduplicator.dedupe(
    "fetchUserData",
    async () => {
      // ... fetch logic ...
    },
    { force, cooldown: STORE.FETCH_COOLDOWN }
  );
}
```

**Benefits:**
- Prevents duplicate calls when multiple components request user data simultaneously
- Respects cooldown period to avoid rapid successive calls

---

### Reward Store

**File:** `src/app/store/rewardStore.js`

**Implementation:**
- `fetchRewards()` - Deduplicated with cooldown
- `fetchRewardHistory()` - Deduplicated with cooldown

**Benefits:**
- Prevents duplicate reward fetches when multiple components load rewards
- Reduces API calls during reward redemption operations

---

### Users Store

**File:** `src/app/store/usersStore.js`

**Implementation:**
- `fetchUsers()` - Deduplicated with cooldown

**Benefits:**
- Prevents duplicate user list fetches
- Important for admin pages that may have multiple components loading user data

---

### Category Store

**File:** `src/app/store/categoryStore.js`

**Implementation:**
- `fetchCategories()` - Deduplicated with cooldown

**Benefits:**
- Prevents duplicate category fetches
- Categories are used across many components, so deduplication is critical

---

### Audit Log Store

**File:** `src/app/store/auditLogStore.js`

**Implementation:**
- `fetchLogs(page, force)` - Deduplicated with cache key based on page and filters

**Special Feature:**
- Uses composite cache key: `fetchLogs-${page}-${JSON.stringify(filters)}`
- Ensures different pages/filters don't interfere with each other
- Still deduplicates identical requests

**Benefits:**
- Prevents duplicate log fetches when filters change rapidly
- Handles pagination correctly

---

## Best Practices

### 1. Use Descriptive Keys

✅ **Good:**
```javascript
deduplicator.dedupe('fetchUserData', ...)
deduplicator.dedupe('fetchRewards', ...)
```

❌ **Bad:**
```javascript
deduplicator.dedupe('fetch', ...) // Too generic
deduplicator.dedupe('data', ...) // Not descriptive
```

### 2. Include Parameters in Cache Key

✅ **Good:**
```javascript
// For paginated/filtered requests
const cacheKey = `fetchLogs-${page}-${JSON.stringify(filters)}`;
deduplicator.dedupe(cacheKey, ...)
```

❌ **Bad:**
```javascript
// Same key for different parameters
deduplicator.dedupe('fetchLogs', ...) // Wrong - different pages will conflict
```

### 3. Use Cooldown for Frequently Called Functions

✅ **Good:**
```javascript
deduplicator.dedupe('fetchUserData', ..., { cooldown: 5000 })
```

❌ **Bad:**
```javascript
// No cooldown for frequently called function
deduplicator.dedupe('fetchUserData', ..., { cooldown: 0 })
```

### 4. Use Force Parameter for User-Initiated Actions

✅ **Good:**
```javascript
// User clicks refresh button
fetchUsers(true); // force = true

// Normal component mount
fetchUsers(); // force = false, uses deduplication
```

---

## Performance Impact

### Before Deduplication

**Scenario:** 5 components mount simultaneously and all call `fetchUsers()`

- **API Calls:** 5 separate requests
- **Network Traffic:** 5x
- **Server Load:** 5x
- **Response Time:** Varies (race conditions possible)

### After Deduplication

**Scenario:** 5 components mount simultaneously and all call `fetchUsers()`

- **API Calls:** 1 request (deduplicated)
- **Network Traffic:** 1x
- **Server Load:** 1x
- **Response Time:** Consistent (all components get same data)

**Improvement:** ~80% reduction in API calls for concurrent requests

---

## Testing

### Manual Testing

1. **Test Deduplication:**
   ```javascript
   // Call fetchUsers from multiple places simultaneously
   Promise.all([
     store.fetchUsers(),
     store.fetchUsers(),
     store.fetchUsers(),
   ]);
   // Should only make 1 API call
   ```

2. **Test Cooldown:**
   ```javascript
   await store.fetchUsers();
   await store.fetchUsers(); // Should use cached result if within cooldown
   ```

3. **Test Force Refresh:**
   ```javascript
   await store.fetchUsers();
   await store.fetchUsers(true); // Should bypass cache and make new request
   ```

---

## Troubleshooting

### Issue: Requests Still Duplicating

**Possible Causes:**
1. Different cache keys being used
2. Force parameter always true
3. Cooldown set to 0

**Solution:**
- Check that cache keys are consistent
- Verify force parameter usage
- Ensure cooldown is set appropriately

### Issue: Stale Data

**Possible Causes:**
1. Cooldown too long
2. Force not being used when needed

**Solution:**
- Adjust cooldown period
- Use force parameter for user-initiated refreshes

---

## Future Improvements

1. **Response Caching:**
   - Cache successful responses and return them during cooldown
   - Currently, cooldown only prevents requests, doesn't return cached data

2. **Automatic Key Generation:**
   - Generate cache keys automatically based on function name and parameters
   - Reduce manual key management

3. **Metrics/Logging:**
   - Track deduplication statistics
   - Log when requests are deduplicated vs. executed

4. **TTL Support:**
   - Add time-to-live for cached responses
   - Automatically invalidate stale cache

---

**Last Updated:** January 2025

