# Refactoring Opportunities & Zustand Store Implementation

**Date:** January 2025  
**Last Updated:** January 2025  
**Purpose:** Identify cleanup opportunities and implement Zustand stores for improved performance and standardization

**Status:** ✅ **Phase 1, 2, & 3 Complete** | ✅ **Selectors Optimized** | ✅ **Error Recovery Implemented**

---

## ✅ Completed: New Zustand Stores Created

### 1. **permissionsStore.js** - Replaces `usePermissions` hook
- **Location:** `packages/lib/stores/store/permissionsStore.js`
- **Benefits:**
  - Shared state across components (no duplicate API calls)
  - Request deduplication with cooldown (60s)
  - Centralized permission checking helpers
  - Better performance via caching

### 2. **featuresStore.js** - Replaces `useFeatures` hook
- **Location:** `packages/lib/stores/store/featuresStore.js`
- **Benefits:**
  - Shared feature flags across all components
  - Request deduplication with cooldown (30s)
  - Centralized feature checking methods
  - Graceful degradation on errors

### 3. **rolesStore.js** - Shared roles management
- **Location:** `packages/lib/stores/store/rolesStore.js`
- **Benefits:**
  - Works for both CMS (super admin) and LMS (tenant admin)
  - Manages roles, permissions, and templates
  - Request deduplication with cooldown (10s)
  - CRUD operations for roles

### 4. **tenantsStore.js** - CMS tenant management
- **Location:** `packages/lib/stores/store/tenantsStore.js`
- **Benefits:**
  - Centralized tenant data management
  - Manages tenants, users, roles, user roles, features
  - Request deduplication with cooldown (10s)
  - Optimized for CMS super admin pages

### 5. **billingStore.js** - LMS billing data
- **Location:** `packages/lib/stores/store/billingStore.js`
- **Benefits:**
  - Shared billing/subscription data
  - Combined fetch methods (tenant + billing)
  - Request deduplication with cooldown (30s)
  - Stripe portal actions included

### 6. **roleTemplatesStore.js** - Shared role templates
- **Location:** `packages/lib/stores/store/roleTemplatesStore.js`
- **Benefits:**
  - Shared templates across CMS and LMS
  - Request deduplication with cooldown (60s)
  - CRUD operations for templates
  - Permission management for templates

---

## 📋 Refactoring Opportunities

### High Priority - Performance Improvements

#### 1. Replace `usePermissions` Hook → `usePermissionsStore`
**Status:** ✅ **COMPLETED** (Hook wraps store for backward compatibility)
**Files Updated:**
- ✅ `packages/lib/hooks/hooks/usePermissions.js` - Now wraps `permissionsStore`
- ✅ `apps/cms/app/cms/(dashboard)/tenants/[tenantId]/page.jsx` - Uses `permissionsStore` directly
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/roles/page.jsx` - Uses `rolesStore.fetchPermissions()`
- ✅ `apps/cms/app/cms/(dashboard)/roles-permissions/page.jsx` - Uses stores for templates (**COMPLETED**)
- 🔲 Components using `usePermissions()` - Can migrate gradually (backward compatible)

**Note:** The roles-permissions page manages global permissions (different from user permissions), so it uses a local fetch for `/permissions` with `includeDeprecated: true`. It uses `roleTemplatesStore` for templates.

**Benefits Achieved:**
- ✅ Eliminates duplicate API calls
- ✅ Shared state across all components
- ✅ Better caching with 60s cooldown
- ✅ Backward compatible (existing code still works)

**Migration pattern:**
```javascript
// Before
import { usePermissions } from '@skill-learn/lib/hooks/usePermissions';
const { permissions, hasPermission, isLoading } = usePermissions(tenantId);

// After
import { usePermissionsStore } from '@skill-learn/lib/stores/permissionsStore';
const { permissions, hasPermission, isLoading, fetchPermissions } = usePermissionsStore();
useEffect(() => { fetchPermissions(tenantId); }, [tenantId, fetchPermissions]);
```

#### 2. Replace `useFeatures` Hook → `useFeaturesStore`
**Status:** ✅ **COMPLETED** (Hook wraps store for backward compatibility)
**Files Updated:**
- ✅ `packages/lib/hooks/hooks/useFeatures.js` - Now wraps `featuresStore`
- 🔲 `apps/cms/app/cms/(dashboard)/features/page.jsx` - Can migrate to store (note: CMS manages global features)
- 🔲 `apps/lms/app/(lms)/(admin)/dashboard/features/page.jsx` - Uses local state (tenant-specific features, different from global)
- 🔲 Components using `useFeatures()` - Can migrate gradually (backward compatible)

**Benefits Achieved:**
- ✅ Eliminates duplicate API calls
- ✅ Shared feature flags across all components
- ✅ Better caching with 30s cooldown
- ✅ Backward compatible (existing code still works)

**Migration pattern:**
```javascript
// Before
import { useFeatures } from '@skill-learn/lib/hooks/useFeatures';
const { isEnabled, isLoading } = useFeatures();

// After
import { useFeaturesStore } from '@skill-learn/lib/stores/featuresStore';
const { isEnabled, isLoading, fetchFeatures } = useFeaturesStore();
useEffect(() => { fetchFeatures(); }, [fetchFeatures]);
```

#### 3. Refactor `TenantSummary.jsx` → Use `billingStore`
**Status:** ✅ **COMPLETED**
**File:** `apps/lms/components/admin/TenantSummary.jsx`
**Changes Made:**
- Removed 3 `useState` hooks (tenant, billing, loading)
- Now uses `billingStore` with `fetchTenantAndBilling()`
- Shared state with BillingPage component
**Benefits:**
- Eliminates duplicate API calls (also fetched in billing page)
- Shared state between TenantSummary and BillingPage
- Better performance via caching (30s cooldown)

#### 4. Refactor CMS Tenant Detail Page → Use `tenantsStore`
**Status:** ✅ **COMPLETED**
**File:** `apps/cms/app/cms/(dashboard)/tenants/[tenantId]/page.jsx`
**Changes Made:**
- Replaced 8 `useState` hooks with `tenantsStore`
- Replaced 8 fetch functions with store methods
- Uses `roleTemplatesStore` for templates
- Uses `permissionsStore` for global permissions
- Reduced code by ~200 lines
**Benefits Achieved:**
- ✅ Single store manages all tenant data
- ✅ Caching with 10s cooldown
- ✅ Shared state if same tenant accessed elsewhere
- ✅ Cleaner component code (reduced ~200 lines)

**Migration:**
```javascript
// Before: 8 useState + 8 fetch functions
const [tenant, setTenant] = useState(null);
const [users, setUsers] = useState([]);
const [roles, setRoles] = useState([]);
// ... 5 more useState

// After: Single store
const { 
  currentTenant: tenant,
  users,
  roles,
  userRoles,
  features,
  isLoading,
  fetchTenant,
  fetchUsers,
  fetchRoles,
  // ... etc
} = useTenantsStore();
```

#### 5. Refactor LMS Admin Pages → Use Stores
**Status:** ✅ **COMPLETED**
**Files:**
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/roles/page.jsx` → `rolesStore` (**COMPLETED**)
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/billing/page.jsx` → `billingStore` (**COMPLETED**)
- ⚠️ `apps/lms/app/(lms)/(admin)/dashboard/features/page.jsx` → Uses local state (tenant-specific features, different from global features)
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/user-roles/page.jsx` → `userRolesStore` (**COMPLETED**)

**Changes Made:**
- Roles page: Replaced 5 `useState` hooks with `rolesStore`, uses store CRUD operations
- Billing page: Replaced 2 `useState` hooks with `billingStore`, uses store actions
- User-roles page: Replaced 3 `useState` hooks (userRoles, roles, users) with `userRolesStore`, uses store methods for assign/remove
**Benefits Achieved:**
- ✅ Shared state between related pages
- ✅ Caching with 10-30s cooldowns
- ✅ Reduced duplicate API calls
- ✅ Better performance via request deduplication

---

### Medium Priority - Code Cleanup

#### 6. Consolidate Permission Fetching
**Status:** ✅ **COMPLETED** (Phase 3)
**Files:**
- ✅ `apps/cms/app/cms/(dashboard)/tenants/[tenantId]/page.jsx` - Uses `permissionsStore` (**COMPLETED**)
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/roles/page.jsx` - Uses `rolesStore.fetchPermissions()` (**COMPLETED**)
- ✅ `apps/cms/app/cms/(dashboard)/roles-permissions/page.jsx` - Uses `roleTemplatesStore`, manages global permissions (**COMPLETED**)

**Note:** The roles-permissions page manages global permissions (not user-specific), so it keeps a local fetch for `/permissions` with `includeDeprecated: true`. The store is used for user permissions elsewhere.

**Solution:** ✅ Complete - Uses stores where applicable (templates), manages global permissions locally (different from user permissions)

**Benefits Achieved:**
- ✅ Consistent data fetching patterns for templates
- ✅ Shared cache for templates across pages
- ✅ Template CRUD operations use store methods
- ✅ Better code organization

#### 7. Consolidate Role Templates Fetching
**Status:** ✅ **COMPLETED** (Phase 3)
**Files:**
- ✅ `apps/cms/app/cms/(dashboard)/tenants/[tenantId]/page.jsx` - Uses `roleTemplatesStore` (**COMPLETED**)
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/roles/page.jsx` - Uses `rolesStore.fetchTemplates()` (**COMPLETED**)
- ✅ `apps/cms/app/cms/(dashboard)/roles-permissions/page.jsx` - Uses `roleTemplatesStore` (**COMPLETED**)

**Note:** LMS uses `/tenant/templates` (template sets), CMS uses `/role-templates` (full template objects). Both patterns are supported by stores.

**Solution:** ✅ Complete - All pages now use appropriate stores

**Benefits Achieved:**
- ✅ Consistent data fetching patterns
- ✅ Shared cache across all template-using pages
- ✅ Eliminates duplicate template fetches
- ✅ Template CRUD operations use store methods

#### 8. Create `userRolesStore` for LMS
**Status:** ✅ **COMPLETED** (Phase 3)
**File:** `apps/lms/app/(lms)/(admin)/dashboard/user-roles/page.jsx`

**Implementation:**
- ✅ Created `packages/lib/stores/store/userRolesStore.js`
- ✅ Manages: `userRoles[]`, `roles[]` (active only), `users[]`
- ✅ Methods: `fetchUserRoles()`, `fetchRoles()`, `fetchUsers()`, `fetchAll()`, `assignRole()`, `removeRole()`
- ✅ Request deduplication with 10s cooldown
- ✅ Retry logic with exponential backoff
- ✅ Refactored user-roles page to use store with selectors

**Changes Made:**
- Replaced 3 local `useState` hooks (userRoles, roles, users) with store state
- Replaced 3 separate `fetch` functions with store methods (`fetchAll()`)
- Updated `handleAssignRole` and `handleRemoveRole` to use store methods
- Uses Zustand selectors for optimized re-renders

**Benefits Achieved:**
- ✅ Shared state between user-roles page and roles page (can be extended)
- ✅ Request deduplication (eliminates duplicate role/user fetches)
- ✅ Better caching (10s cooldown)
- ✅ Consistent with other store patterns
- ✅ Retry logic for better reliability
- ✅ Optimized with selectors (reduced re-renders)

**Estimated Impact:** Medium - Eliminates duplicate role/user fetches, improves reliability

---

### Low Priority - Additional Improvements

#### 9. ✅ Loading States Standardization
**Status:** ✅ **COMPLETED** (All stores have standardized `isLoading`)
**Status:** ✅ **ALREADY STANDARDIZED** (All stores have `isLoading`)
**Current State:**
- ✅ All stores (new and existing) have `isLoading: false` in their state
- ✅ All stores set `isLoading: true` at start of fetch operations
- ✅ All stores set `isLoading: false` in finally/error handlers
- ✅ Consistent pattern across all stores in the codebase

**Verified Stores with `isLoading`:**
**New Stores (Created in this refactor):**
- ✅ `permissionsStore.js` - Has `isLoading`
- ✅ `featuresStore.js` - Has `isLoading`
- ✅ `rolesStore.js` - Has `isLoading`
- ✅ `tenantsStore.js` - Has `isLoading`
- ✅ `billingStore.js` - Has `isLoading`
- ✅ `roleTemplatesStore.js` - Has `isLoading`

**Existing Stores:**
- ✅ `pointsStore.js` - Has `isLoading`
- ✅ `usersStore.js` - Has `isLoading`
- ✅ `rewardStore.js` - Has `isLoading`
- ✅ `categoryStore.js` - Has `isLoading`
- ✅ `progressStore.js` - Has `isLoading`

**Standardized Pattern:**
```javascript
export const useMyStore = create((set, get) => ({
  // State
  data: [],
  isLoading: false,  // ✅ Standardized
  error: null,
  lastUpdated: null,

  // Fetch function
  fetchData: async (force = false) => {
    set({ isLoading: true, error: null });  // ✅ Set loading at start
    try {
      // ... fetch logic
      set({ data: result, isLoading: false });  // ✅ Clear loading on success
    } catch (error) {
      set({ error: error.message, isLoading: false });  // ✅ Clear loading on error
      throw error;
    }
  },
}));
```

**Benefits Achieved:**
- ✅ Consistent loading state management across all stores
- ✅ Easy to check loading status in components
- ✅ Standardized pattern established
- ✅ All stores follow the same pattern (no inconsistency)

#### 10. Add Error Recovery
**Status:** ✅ **COMPLETED** (Phase 3 - Error Recovery)
**Implementation:** ✅ Added retry logic with exponential backoff to all key stores

**Before (Previous Pattern):**
```javascript
try {
  const response = await api.get("/endpoint");
  // ... handle success
} catch (error) {
  handleErrorWithNotification(error, "Failed to load data");
  set({ error: error.message, isLoading: false });
  throw error;
}
// No retry logic - fails immediately on network/5xx errors
```

**After (Optimized Pattern - Now Implemented):**
```javascript
try {
  const response = await retryWithBackoff(
    () => api.get("/endpoint"),
    {
      maxRetries: 3,
      baseDelay: 1000,
      onRetry: (attempt, error, delay) => {
        set({ retryCount: attempt });
        console.log(`Retrying (attempt ${attempt}/${3}) after ${delay}ms`);
      },
    }
  );
  // ... handle success
} catch (error) {
  // All retries exhausted - show error
  handleErrorWithNotification(error, "Failed to load data");
  set({ error: error.message, isLoading: false, retryCount: 0 });
  throw error;
}
```

**Stores Enhanced:**
- ✅ `tenantsStore.js` - All fetch methods have retry logic
- ✅ `billingStore.js` - Billing data fetching with retry
- ✅ `rolesStore.js` - Roles and permissions fetching with retry
- ✅ `permissionsStore.js` - Permissions fetching with retry
- ✅ `roleTemplatesStore.js` - Template fetching with retry

**Retry Strategy:**
- ✅ **Retries on:** Network errors, 5xx server errors, 429 rate limits, 504 timeouts
- ✅ **Doesn't retry on:** 4xx client errors (except 429)
- ✅ **Exponential backoff:** Base delay × 2^attempt with jitter
- ✅ **Configurable:** Max retries (default: 3), base delay (default: 1000ms), max delay (default: 30000ms)
- ✅ **Retry-After support:** Respects HTTP `Retry-After` header for 429 errors
- ✅ **Retry tracking:** Stores track `retryCount` for UI feedback

**Benefits Achieved:**
- ✅ Better resilience to transient network/server errors
- ✅ Automatic recovery from temporary outages
- ✅ Improved UX (users don't see errors for recoverable failures)
- ✅ Respects rate limits with exponential backoff
- ✅ Configurable retry behavior per store/endpoint
- ✅ UI can show retry progress via `retryCount` state

**Technical Details:**
- Created `packages/lib/utils/utils/retry.js` utility
- `retryWithBackoff()` function handles retry logic with exponential backoff
- `shouldRetryError()` determines if an error should be retried
- `calculateDelay()` implements exponential backoff with jitter
- `getRetryAfterDelay()` respects HTTP Retry-After headers
- All stores now track `retryCount` state for optional UI feedback

**Estimated Impact:** Medium-High - Significantly improved reliability and user experience during network issues

#### 11. Optimize Store Selectors
**Status:** ✅ **COMPLETED** (Phase 3 - Performance Optimization)
**Implementation:** ✅ Optimized all refactored components to use Zustand selectors

**Before (Previous Pattern):**
```javascript
const { roles, isLoading, error } = useRolesStore();
// Component re-renders when ANY store state changes (roles, isLoading, error, tenant, etc.)
```

**After (Optimized Pattern - Now Implemented):**
```javascript
const roles = useRolesStore((state) => state.roles);
const isLoading = useRolesStore((state) => state.isLoading);
const error = useRolesStore((state) => state.error);
// Component only re-renders when selected slices change
```

**Components Optimized:**
- ✅ `apps/lms/components/admin/TenantSummary.jsx` - Uses selectors for billing store
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/billing/page.jsx` - Uses selectors
- ✅ `apps/lms/app/(lms)/(admin)/dashboard/roles/page.jsx` - Uses selectors
- ✅ `apps/cms/app/cms/(dashboard)/tenants/[tenantId]/page.jsx` - Uses selectors
- ✅ `apps/cms/app/cms/(dashboard)/roles-permissions/page.jsx` - Uses selectors

**Benefits Achieved:**
- ✅ Reduced re-renders (only when selected state changes)
- ✅ Better performance in large components (especially tenant detail page)
- ✅ More granular reactivity control
- ✅ Easier to identify what state triggers re-renders
- ✅ Improved performance in components with many store subscriptions

**Technical Details:**
- Each state slice uses its own selector: `useStore((state) => state.slice)`
- Actions/functions use selectors to maintain stable references
- `getState()` used for accessing fresh state after mutations without causing re-renders
- Pattern maintains backward compatibility with store API

**Estimated Impact:** Medium - Improved performance, especially in large components with many subscriptions

---

## 🎯 Implementation Priority

### Phase 1: Quick Wins (Do First)
1. ✅ Replace `TenantSummary` with `billingStore` (**COMPLETED**)
2. ✅ Replace `useFeatures` hook with `featuresStore` (**COMPLETED** - hook now wraps store)
3. ✅ Replace `usePermissions` hook with `permissionsStore` (**COMPLETED** - hook now wraps store)

### Phase 2: High Impact (Do Next)
4. ✅ Refactor CMS tenant detail page to use `tenantsStore` (**COMPLETED**)
5. ✅ Refactor LMS roles page to use `rolesStore` (**COMPLETED**)
6. ✅ Refactor LMS billing page to use `billingStore` (**COMPLETED**)

### Phase 3: Consolidation
7. ✅ Create `userRolesStore` for LMS (**COMPLETED**)
   - **File:** `apps/lms/app/(lms)/(admin)/dashboard/user-roles/page.jsx`
   - **Purpose:** Manage user roles, roles, and users in a shared store
   - **Benefits Achieved:** 
     - ✅ Shared state with roles page (can be extended)
     - ✅ Request deduplication for user roles
     - ✅ Retry logic for better reliability
     - Better caching between related pages
   - **Estimated Impact:** Medium - reduces duplicate API calls when navigating between user-roles and roles pages

8. ✅ Consolidate permission/template fetching (**COMPLETED**)
   - **Files:**
     - ✅ `apps/cms/app/cms/(dashboard)/roles-permissions/page.jsx` - Now uses `roleTemplatesStore` (**COMPLETED**)
     - ✅ `apps/cms/app/cms/(dashboard)/tenants/[tenantId]/page.jsx` - Uses stores (**COMPLETED**)
     - ✅ `apps/lms/app/(lms)/(admin)/dashboard/roles/page.jsx` - Uses stores (**COMPLETED**)
   - **Benefits Achieved:** ✅ Consistent data fetching patterns, shared cache for templates
   - **Impact:** ✅ Code consistency achieved, cache sharing for templates

9. ✅ Add store selectors for optimization (**COMPLETED**)
   - **Implementation:** ✅ Optimized all refactored components to use Zustand selectors
   - **Example:** `const roles = useRolesStore((state) => state.roles);`
   - **Components Optimized:**
     - ✅ TenantSummary, Billing page, Roles page
     - ✅ CMS tenant detail page, Roles-permissions page
   - **Benefits Achieved:** 
     - ✅ Reduced re-renders (only re-render when selected state changes)
     - ✅ Better performance in large components
     - ✅ More granular reactivity
   - **Impact:** Medium - Improved performance, especially in components with many subscriptions

---

## 📊 Expected Performance Improvements

### Before (Current State)
- **Tenant Detail Page:** 8 API calls on load, no caching
- **Features Check:** 2-3 duplicate calls per page load
- **Permissions Check:** 2-3 duplicate calls per page load
- **Billing Data:** 2 calls in TenantSummary, 2 more in BillingPage

### After (With Stores)
- **Tenant Detail Page:** 8 API calls first load, cached for 10s
- **Features Check:** 1 call, shared across all components, cached 30s
- **Permissions Check:** 1 call, shared across all components, cached 60s
- **Billing Data:** 1 call, shared between TenantSummary and BillingPage, cached 30s

### Estimated Impact
- **~50% reduction** in duplicate API calls
- **~30% faster** page loads (via caching)
- **Better UX** (instant data in cached components)
- **Reduced server load** (fewer requests)

---

## 🔧 Store Usage Patterns

### Pattern 1: Simple Fetch Store
```javascript
import { useFeaturesStore } from '@skill-learn/lib/stores/featuresStore';

function MyComponent() {
  const { features, isLoading, fetchFeatures, isEnabled } = useFeaturesStore();
  
  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);
  
  if (isLoading) return <Loader />;
  if (isEnabled('games')) return <Games />;
}
```

### Pattern 2: CRUD Store
```javascript
import { useRolesStore } from '@skill-learn/lib/stores/rolesStore';

function RolesPage() {
  const { roles, isLoading, fetchRoles, createRole, updateRole } = useRolesStore();
  
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  
  const handleCreate = async (data) => {
    await createRole(data);
    // Store automatically refreshes roles
  };
}
```

### Pattern 3: Store with Selectors (Optimized)
```javascript
import { useRolesStore } from '@skill-learn/lib/stores/rolesStore';

function RolesList() {
  // Only re-renders when roles change, not on isLoading changes
  const roles = useRolesStore((state) => state.roles);
  const isLoading = useRolesStore((state) => state.isLoading);
  
  // ...
}
```

---

## 🚀 Next Steps

1. ✅ **Test new stores** - Verify they work correctly (**COMPLETED**)
2. ✅ **Refactor TenantSummary** - **DONE**
3. ✅ **Refactor useFeatures/usePermissions** - Hooks now wrap stores (backward compatible)
4. ✅ **Refactor CMS tenant detail page** - Biggest win (**COMPLETED**)
5. ✅ **Refactor LMS admin pages** - High priority pages done (**COMPLETED**)
6. ✅ **Document migration guide** - See `REFACTORING_SUMMARY.md` (**COMPLETED**)

### Remaining Work (Phase 3: Medium/Low Priority)

#### ✅ High Value - COMPLETED
1. ✅ **Create `userRolesStore` for LMS** (**COMPLETED**)
   - **File:** `apps/lms/app/(lms)/(admin)/dashboard/user-roles/page.jsx`
   - **Effort:** Medium (similar to existing stores)
   - **Impact:** Medium - Eliminates duplicate role/user fetches between pages
   - **Implementation:**
     - ✅ Created `packages/lib/stores/store/userRolesStore.js`
     - ✅ Stores: `userRoles`, `roles` (active only), `users`
     - ✅ Methods: `fetchUserRoles()`, `fetchRoles()`, `fetchUsers()`, `fetchAll()`, `assignRole()`, `removeRole()`
     - ✅ Refactored user-roles page to use store with selectors
     - ✅ Integrated retry logic with exponential backoff
   - **Benefits Achieved:**
     - ✅ Shared cache for user roles, roles, and users across components
     - ✅ Request deduplication for concurrent fetches
     - ✅ Reduced API calls (cached data reused)
     - ✅ Better error handling with retry logic
     - ✅ Consistent patterns with other stores

#### ✅ Code Consistency - COMPLETED
2. ✅ **Refactor CMS roles-permissions page to use stores** (**COMPLETED**)
   - **File:** `apps/cms/app/cms/(dashboard)/roles-permissions/page.jsx`
   - **Changes Made:**
     - Uses `roleTemplatesStore` for templates (CRUD operations)
     - Template fetching uses store
     - Global permissions managed locally (different from user permissions in store)
   - **Benefits:** ✅ Code consistency for templates, shared cache, better organization

#### ✅ Performance Optimization - COMPLETED
3. ✅ **Optimize with Zustand selectors for better performance** (**COMPLETED**)
   - **Effort:** Low-Medium (update existing components)
   - **Impact:** Medium - Better performance in large components
   - **Implementation:** ✅ All refactored components now use selectors
   - **See:** Section 11 above for details

#### ✅ Quality Improvements - COMPLETED
4. ✅ **Add error recovery mechanisms** (**COMPLETED**)
   - **Effort:** Medium (implement retry logic)
   - **Impact:** Medium-High - Better UX during network issues
   - **Implementation:** ✅ Retry logic with exponential backoff added to all key stores
   - **Features Achieved:** 
     - ✅ Retry failed requests (network/5xx errors)
     - ✅ Exponential backoff with jitter
     - ✅ Retry-After header support for rate limits
     - ✅ Retry count tracking for UI feedback
   - **See:** Section 10 above for details

---

## 📝 Notes

- All stores follow existing patterns from `pointsStore`, `usersStore`, etc.
- Request deduplication prevents duplicate concurrent calls
- Cooldown periods prevent excessive refetching
- Error handling is consistent across all stores
- Stores are exported from `@skill-learn/lib/stores/*`
