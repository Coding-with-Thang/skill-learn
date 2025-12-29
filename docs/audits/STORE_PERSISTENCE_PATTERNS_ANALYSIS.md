# Store Persistence Patterns Analysis

## Current State

### Stores WITH `persist` (2 stores)

#### 1. `categoryStore.js`

- **What's persisted:** `categories` array, `lastFetch` timestamp
- **Why:** Categories change infrequently, persist to avoid refetch on page reload
- **Partialize:** Only persists `categories` and `lastFetch` (excludes `isLoading`, `error`)

#### 2. `coursesStore.js`

- **What's persisted:** Filter state (`category`, `pageSize`, `currentPage`, `selectedCourseId`, `previewImageUrl`)
- **Why:** UI preferences - user's filter selections should persist across sessions
- **All fields persisted:** Entire state (no `partialize`)

### Stores WITHOUT `persist` (5 stores)

#### 1. `pointsStore.js`

- **Reason:** User-specific, frequently changing data with cooldown logic
- **Alternative:** Uses in-memory caching with `FETCH_COOLDOWN`

#### 2. `rewardStore.js`

- **Reason:** Server data that should always be fresh
- **Alternative:** Fetched on demand

#### 3. `usersStore.js`

- **Reason:** Admin data that changes frequently, should always be fresh
- **Alternative:** Fetched on demand

#### 4. `quizStore.js`

- **Reason:** Session state (quiz configuration during active quiz)
- **Alternative:** Session-specific, shouldn't persist between sessions

#### 5. `auditLogStore.js`

- **Reason:** Server data with filters, should always be fresh
- **Alternative:** Fetched on demand

## Issues with Current Pattern

### 1. **Inconsistent Decision Criteria**

**Problem:** No clear rule for when to use `persist`

- `categoryStore` persists data but `rewardStore` doesn't (both are server data)
- `coursesStore` persists UI state but `quizStore` doesn't (both are UI state)
- Decision seems arbitrary, not based on clear principles

### 2. **Missing Documentation**

**Problem:** No explanation for why certain stores persist and others don't

- Developers don't know when to use `persist` for new stores
- Risk of inconsistent decisions in the future
- Onboarding requires code review to understand patterns

### 3. **Potential Performance Issues**

**Problem:** `categoryStore` persists large data arrays

- Categories array could grow over time
- localStorage has size limits (~5-10MB)
- No cleanup mechanism if categories grow significantly

### 4. **Stale Data Risks**

**Problem:** Persisted data might become outdated

- `categoryStore` persists categories but no expiration logic
- User might see outdated categories if they don't refresh
- `lastFetch` is stored but not consistently used for expiration

## Proposed Standardization Approach

### Decision Framework

#### ✅ **USE `persist` for:**

1. **UI Preferences & Filter State**

   - User's filter selections (category, sort order, page size)
   - View preferences (list vs grid, theme settings)
   - Form draft state (if applicable)
   - **Example:** `coursesStore` (filters, pagination)

2. **Static/Infrequently Changing Reference Data**

   - Data that rarely changes and is expensive to fetch
   - Must have expiration/invalidation strategy
   - **Example:** Categories (with TTL/expiration)
   - **Requires:** TTL logic, invalidation on updates

3. **User Preferences**
   - Settings, preferences, customization
   - **Example:** Theme, language, display preferences

#### ❌ **DON'T USE `persist` for:**

1. **Frequently Changing Server Data**

   - Points, rewards, user data, audit logs
   - Data that changes often or must be fresh
   - **Use:** In-memory caching with cooldown/invalidation instead

2. **Session State**

   - Active quiz, current form state, temporary selections
   - State that should reset between sessions
   - **Use:** Regular Zustand store (no persist)

3. **Large Datasets**

   - Arrays that could grow significantly
   - Risk of hitting localStorage limits
   - **Use:** Server-side caching or in-memory only

4. **Security-Sensitive Data**
   - User credentials, tokens, sensitive information
   - **Use:** Secure storage (separate from Zustand persist)

### Standardized Patterns

#### Pattern 1: Persisted UI State Store

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFiltersStore = create(
  persist(
    (set) => ({
      // UI state only
      category: "",
      pageSize: 10,
      currentPage: 1,
      sortOrder: "asc",

      // Actions
      setCategory: (cat) => set({ category: cat, currentPage: 1 }),
      setPageSize: (size) => set({ pageSize: size }),
      reset: () => set({ category: "", pageSize: 10, currentPage: 1 }),
    }),
    {
      name: "filters-storage",
      // Only persist UI state (exclude loading/error states)
      partialize: (state) => ({
        category: state.category,
        pageSize: state.pageSize,
        currentPage: state.currentPage,
        sortOrder: state.sortOrder,
      }),
      // SSR-safe
      getStorage: () =>
        typeof window !== "undefined" ? window.localStorage : undefined,
    }
  )
);
```

**When to use:**

- Filter state
- View preferences
- UI customization

#### Pattern 2: Persisted Reference Data (with TTL)

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const useCategoryStore = create(
  persist(
    (set, get) => ({
      categories: [],
      lastFetch: null,
      isLoading: false,
      error: null,

      fetchCategories: async (force = false) => {
        const state = get();
        const now = Date.now();

        // Check if cache is still valid
        if (
          !force &&
          state.lastFetch &&
          now - state.lastFetch < CACHE_TTL &&
          state.categories.length > 0
        ) {
          return state.categories; // Return cached data
        }

        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/categories");
          const categories = extractField(response, "categories") || [];

          set({
            categories,
            lastFetch: Date.now(),
            isLoading: false,
          });
          return categories;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Invalidate cache (call when categories are updated)
      invalidateCache: () => {
        set({ lastFetch: null });
      },
    }),
    {
      name: "category-store",
      partialize: (state) => ({
        categories: state.categories,
        lastFetch: state.lastFetch,
      }),
      getStorage: () =>
        typeof window !== "undefined" ? window.localStorage : undefined,
    }
  )
);
```

**When to use:**

- Static reference data
- Must include TTL/expiration logic
- Must have invalidation mechanism

#### Pattern 3: Non-Persisted Server Data Store

```javascript
import { create } from "zustand";
import api from "@/utils/axios";

const FETCH_COOLDOWN = 5000; // 5 seconds

export const useRewardStore = create((set, get) => ({
  rewards: [],
  isLoading: false,
  error: null,
  lastFetch: null,

  fetchRewards: async (force = false) => {
    const state = get();
    const now = Date.now();

    // In-memory cache with cooldown
    if (
      !force &&
      state.lastFetch &&
      now - state.lastFetch < FETCH_COOLDOWN &&
      state.rewards.length > 0
    ) {
      return state.rewards;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user/rewards");
      const rewards = extractField(response, "rewards") || [];

      set({
        rewards,
        lastFetch: Date.now(),
        isLoading: false,
      });
      return rewards;
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },
}));
```

**When to use:**

- Frequently changing data
- User-specific data
- Must-always-be-fresh data
- Use in-memory caching with cooldown instead

#### Pattern 4: Session State Store

```javascript
import { create } from "zustand";

export const useQuizStore = create((set) => ({
  config: {
    id: "",
    numberOfQuestions: 10,
    category: { id: 0, name: "" },
    status: "",
    score: 0,
  },

  // Actions
  setConfig: (config) => set({ config }),
  reset: () =>
    set({
      config: {
        id: "",
        numberOfQuestions: 10,
        category: { id: 0, name: "" },
        status: "",
        score: 0,
      },
    }),
}));
```

**When to use:**

- Temporary session state
- Should reset on page reload
- Form drafts (if reset is desired)

## Transition Strategy

### Phase 1: Documentation & Guidelines

1. **Create decision tree document**

   - Flowchart for "Should I use persist?"
   - Clear criteria with examples

2. **Document current stores**

   - Explain why each store uses/doesn't use persist
   - Identify any inconsistencies

3. **Create store template**
   - Template files for each pattern
   - Include comments explaining when to use

### Phase 2: Standardize Existing Stores

#### Priority 1: Add TTL to `categoryStore`

**Current:**

- Persists categories without expiration
- Risk of stale data

**Change:**

- Add TTL check in `fetchCategories`
- Add `invalidateCache` method
- Document expiration strategy

#### Priority 2: Review `coursesStore`

**Current:**

- Persists all filter state
- This is correct usage (UI preferences)

**Change:**

- Add `partialize` to exclude non-persistable fields (if any added later)
- Document that this is the correct pattern for UI state

#### Priority 3: Document Non-Persisted Stores

**Current:**

- No explanation for why they don't persist

**Change:**

- Add comments explaining decision
- Reference the decision framework

### Phase 3: Template Creation

Create template files:

1. `templates/store-persisted-ui-state.js.template`
2. `templates/store-persisted-reference-data.js.template`
3. `templates/store-non-persisted-server-data.js.template`
4. `templates/store-session-state.js.template`

Each template includes:

- Pattern explanation
- When to use
- Example usage
- Best practices

## Benefits of Standardization

### 1. **Consistency**

**Before:**

- Developers guess when to use `persist`
- Inconsistent decisions across codebase
- Some stores persist when they shouldn't, others don't when they should

**After:**

- Clear rules for when to use `persist`
- Consistent patterns across all stores
- Easy to verify compliance

### 2. **Performance Optimization**

**Before:**

- `categoryStore` persists without expiration → stale data risk
- No clear caching strategy

**After:**

- TTL-based expiration for persisted data
- Clear caching strategies (in-memory vs localStorage)
- Better performance through appropriate caching

### 3. **Maintainability**

**Before:**

- Each store is a unique case
- Hard to understand why decisions were made
- Requires code review to understand patterns

**After:**

- Clear patterns and templates
- Self-documenting code
- Easier onboarding for new developers

### 4. **Bug Prevention**

**Before:**

- Risk of persisting sensitive data
- Risk of stale data causing bugs
- Risk of localStorage size limits

**After:**

- Clear guidelines prevent mistakes
- TTL prevents stale data
- `partialize` ensures only safe data is persisted

### 5. **Developer Experience**

**Before:**

- "Should I use persist?" → Guess or ask
- No clear examples
- Trial and error

**After:**

- Clear decision framework
- Template files for copy-paste
- Examples for each pattern

## Downsides & Risks

### 1. **Migration Effort**

**Risk:** Updating existing stores requires:

- Reviewing each store's usage
- Understanding why current pattern exists
- Testing to ensure no regressions
- Potential breaking changes if cache behavior changes

**Mitigation:**

- Gradual migration (one store at a time)
- Thorough testing after each change
- Keep old behavior during transition period

### 2. **Breaking Changes**

**Risk:** Changing persistence behavior might:

- Break features that rely on persisted data
- Change user experience (e.g., filters resetting)
- Cause data loss if persisted data is removed

**Mitigation:**

- Careful review of store usage
- Gradual rollout with testing
- Document changes in migration guide
- Consider backward compatibility

### 3. **Over-Engineering**

**Risk:** Standardization might:

- Add complexity where simple stores suffice
- Require patterns that aren't needed for all cases
- Create unnecessary abstraction layers

**Mitigation:**

- Keep patterns simple
- Only standardize common cases
- Allow exceptions with documentation
- Focus on clarity over strict rules

### 4. **Storage Limitations**

**Risk:** Persisting too much data:

- Hit localStorage size limits (~5-10MB)
- Performance degradation
- Browser compatibility issues

**Mitigation:**

- Use `partialize` to limit persisted data
- Implement TTL to prevent unbounded growth
- Monitor localStorage usage
- Clear old data periodically

### 5. **Stale Data Issues**

**Risk:** Even with TTL:

- Users might see outdated data
- Cache invalidation complexity
- Race conditions between fetch and persist

**Mitigation:**

- Implement proper TTL checks
- Add invalidation methods
- Document cache invalidation strategy
- Consider versioning persisted data

### 6. **SSR/Hydration Issues**

**Risk:** Persist middleware can cause:

- Hydration mismatches in Next.js
- SSR/client state differences
- Flash of wrong content

**Mitigation:**

- Always use `getStorage` with window check
- Test SSR scenarios
- Use `skipHydration` if needed
- Document SSR considerations

## Recommended Action Plan

### Immediate Actions (Low Risk)

1. ✅ **Document current patterns**

   - Create this analysis document
   - Document why each store uses/doesn't use persist

2. ✅ **Create decision framework**
   - Decision tree flowchart
   - Clear criteria with examples

### Short Term (Medium Risk)

3. **Add TTL to `categoryStore`**

   - Implement expiration logic
   - Add invalidation method
   - Test thoroughly

4. **Create store templates**
   - 4 template files
   - Include examples and documentation
   - Add to project templates folder

### Long Term (Higher Risk - Requires Careful Planning)

5. **Review and standardize all stores**

   - Evaluate each store against framework
   - Migrate gradually
   - Test extensively

6. **Add tooling**
   - ESLint rule to enforce patterns (optional)
   - Store validation in tests
   - Documentation generator

## Example: Transition for `categoryStore`

### Current Implementation Issues

```javascript
// ❌ Current: Persists without expiration
export const useCategoryStore = create(
  persist(
    (set) => ({
      categories: [],
      lastFetch: null,
      fetchCategories: async () => {
        // Fetches and persists, but never checks expiration
        const response = await api.get("/categories");
        set({ categories: response.data, lastFetch: Date.now() });
      },
    }),
    { name: "category-store" }
  )
);
```

### Improved Implementation

```javascript
// ✅ Improved: With TTL and invalidation
const CATEGORY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const useCategoryStore = create(
  persist(
    (set, get) => ({
      categories: [],
      lastFetch: null,
      isLoading: false,
      error: null,

      fetchCategories: async (force = false) => {
        const state = get();
        const now = Date.now();

        // Check cache validity
        if (
          !force &&
          state.lastFetch &&
          now - state.lastFetch < CATEGORY_CACHE_TTL &&
          state.categories.length > 0
        ) {
          return state.categories; // Return cached
        }

        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/categories");
          const categories = extractField(response, "categories") || [];

          set({
            categories,
            lastFetch: Date.now(),
            isLoading: false,
          });
          return categories;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Call this when categories are updated (admin actions)
      invalidateCache: () => {
        set({ lastFetch: null });
      },
    }),
    {
      name: "category-store",
      partialize: (state) => ({
        categories: state.categories,
        lastFetch: state.lastFetch,
      }),
      getStorage: () =>
        typeof window !== "undefined" ? window.localStorage : undefined,
    }
  )
);
```

### Migration Steps

1. **Add TTL constant**
2. **Update `fetchCategories` with expiration check**
3. **Add `invalidateCache` method**
4. **Update admin routes to call `invalidateCache` when categories change**
5. **Test expiration logic**
6. **Monitor localStorage usage**

## Summary

**Current State:**

- 2 stores with `persist` (inconsistent patterns)
- 5 stores without `persist` (no clear reason documented)
- No decision framework
- No templates or guidelines

**Proposed State:**

- Clear decision framework
- 4 standardized patterns
- Templates for common use cases
- Documentation for each pattern
- TTL/expiration for persisted data

**Key Benefits:**

- Consistency across codebase
- Better performance (appropriate caching)
- Easier maintenance
- Bug prevention
- Better developer experience

**Key Risks:**

- Migration effort
- Potential breaking changes
- Over-engineering risk
- Storage limitations
- Stale data issues

**Recommendation:**
Start with documentation and templates (low risk), then gradually improve existing stores. Focus on adding TTL to `categoryStore` as the highest priority fix.
