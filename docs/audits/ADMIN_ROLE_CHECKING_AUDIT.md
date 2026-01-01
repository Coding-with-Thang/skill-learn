# Admin Role Checking Audit Report

**Date:** January 2025  
**Scope:** All API routes, server actions, and admin-protected endpoints  
**Status:** ⚠️ **INCONSISTENCIES FOUND**

---

## Executive Summary

The codebase uses **three different patterns** for admin role checking:

1. ✅ **Standardized Pattern** (Most Common): `requireAdmin()` utility from `@/utils/auth`
2. ⚠️ **Manual Pattern**: Direct role checking in server actions
3. ❌ **Missing Checks**: Some admin routes have no authorization

---

## ✅ Standardized Pattern (Using `requireAdmin()`)

**Location:** `src/utils/auth.js`

**Implementation:**

```javascript
export async function requireAdmin() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const userId = authResult;
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "OPERATIONS") {
    return NextResponse.json(
      { error: "Unauthorized - Requires OPERATIONS role" },
      { status: 403 }
    );
  }
  return { userId, user };
}
```

**Routes Using This Pattern (✅ Correct):**

1. ✅ `src/app/api/admin/categories/route.js` - GET, POST
2. ✅ `src/app/api/admin/categories/[categoryId]/route.js` - GET, PUT, DELETE
3. ✅ `src/app/api/admin/quizzes/route.js` - GET, POST
4. ✅ `src/app/api/admin/quizzes/[quizId]/route.js` - GET, PUT, DELETE
5. ✅ `src/app/api/admin/courses/[courseId]/route.js` - GET, PUT, DELETE
6. ✅ `src/app/api/admin/audit-logs/route.js` - GET (POST uses `requireAuth` only)
7. ✅ `src/app/api/users/route.js` - GET, POST
8. ✅ `src/app/api/users/[userId]/route.js` - GET, PUT, DELETE

**Total:** 8 route files, 20+ endpoints correctly protected

---

## ⚠️ Manual Pattern (Server Actions)

**Issue:** Server actions perform their own admin checking instead of using `requireAdmin()`.

### 1. `src/lib/actions/settings.js`

**Pattern:**

```javascript
const { userId } = await auth();
const user = await prisma.user.findUnique({
  where: { clerkId: userId },
  select: { id: true, role: true },
});
if (!user || user.role !== "OPERATIONS") {
  throw new Error("Unauthorized - Admin access required");
}
```

**Used By:**

- `src/app/api/admin/settings/route.js` - GET, POST (relies on server action for auth)

**Issues:**

- ❌ Inconsistent error handling (throws Error instead of returning NextResponse)
- ❌ Duplicates logic from `requireAdmin()`
- ❌ Different error message format

### 2. `src/app/api/admin/courses/actions.js`

**Pattern:**

```javascript
const { userId: clerkUserId } = await auth();
const dbUser = await prisma.user.findUnique({
  where: { clerkId: clerkUserId },
});
if (dbUser.role !== "OPERATIONS") {
  return { status: "error", message: "Forbidden: insufficient permissions..." };
}
```

**Used By:**

- `src/app/api/admin/courses/create/route.js` - POST (relies on server action for auth)

**Issues:**

- ❌ Returns error object instead of HTTP response
- ❌ Duplicates logic from `requireAdmin()`
- ❌ Different error message format

---

## ❌ Missing Admin Checks (CRITICAL)

### 1. `src/app/api/admin/users/points/route.js`

**Route:** `GET /api/admin/users/points`

**Issue:** ❌ **NO ADMIN CHECK** - Anyone can access user points data!

**Current Code:**

```javascript
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Risk:** 🔴 **HIGH** - Exposes all user data without authorization

---

### 2. `src/app/api/admin/courses/upload/route.js`

**Route:** `POST /api/admin/courses/upload`  
**Route:** `DELETE /api/admin/courses/upload`

**Issue:** ❌ **NO ADMIN CHECK** - Anyone can upload/delete files!

**Current Code:**

```javascript
export async function POST(req) {
  // No admin check!
  const formData = await req.formData();
  // ... file upload logic
}

export async function DELETE(req) {
  // No admin check!
  // ... file deletion logic
}
```

**Risk:** 🔴 **HIGH** - File upload/delete without authorization

---

### 3. `src/app/api/admin/upload/route.js`

**Route:** `POST /api/admin/upload`  
**Route:** `DELETE /api/admin/upload`

**Issue:** ❌ **NO ADMIN CHECK** - Anyone can upload/delete files!

**Current Code:**

```javascript
export async function POST(req) {
  // No admin check!
  // ... file upload logic
}

export async function DELETE(req) {
  // No admin check!
  // ... file deletion logic
}
```

**Risk:** 🔴 **HIGH** - File upload/delete without authorization

---

### 4. `src/app/api/admin/audit-logs/route.js` - POST endpoint

**Route:** `POST /api/admin/audit-logs`

**Issue:** ⚠️ Uses `requireAuth()` instead of `requireAdmin()`

**Current Code:**

```javascript
export async function POST(request) {
  try {
    const authResult = await requireAuth(); // Should be requireAdmin()
    // ... creates audit log
  }
}
```

**Risk:** 🟡 **MEDIUM** - Any authenticated user can create audit logs (should be admin-only)

---

## Client-Side Checks (UI Only)

**Files:**

- `src/components/layout/Sidebar.jsx`
- `src/components/layout/MobileSidebar.jsx`
- `src/components/layout/Header.jsx`
- `src/components/layout/DashboardLayout.jsx`

**Pattern:**

```javascript
const isOperations = role === "OPERATIONS";
const isAdminRoute = pathname?.startsWith("/dashboard");
```

**Status:** ✅ **ACCEPTABLE** - These are UI-only checks for navigation/routing. Security is enforced server-side.

---

## Summary Statistics

| Category                      | Count            | Status          |
| ----------------------------- | ---------------- | --------------- |
| Routes using `requireAdmin()` | 20+ endpoints    | ✅ Correct      |
| Routes with manual checks     | 2 server actions | ⚠️ Inconsistent |
| Routes missing admin checks   | 5 endpoints      | ❌ **CRITICAL** |
| Client-side checks            | 4 components     | ✅ Acceptable   |

---

## Recommendations

### 🔴 CRITICAL (Fix Immediately)

1. **Add `requireAdmin()` to missing routes:**
   - `src/app/api/admin/users/points/route.js` - GET
   - `src/app/api/admin/courses/upload/route.js` - POST, DELETE
   - `src/app/api/admin/upload/route.js` - POST, DELETE
   - `src/app/api/admin/audit-logs/route.js` - POST (change to `requireAdmin()`)

### 🟡 HIGH PRIORITY (Standardize)

2. **Refactor server actions to use `requireAdmin()`:**

   - Update `src/lib/actions/settings.js` to accept pre-validated admin user
   - Update `src/app/api/admin/courses/actions.js` to accept pre-validated admin user
   - Or: Move admin check to route level before calling server action

3. **Create shared admin check wrapper:**
   - Consider creating `withAdminAuth()` wrapper for server actions
   - Standardize error responses across all patterns

### 🟢 LOW PRIORITY (Documentation)

4. **Add JSDoc comments:**

   - Document that all `/api/admin/*` routes require OPERATIONS role
   - Add security notes in route files

5. **Add tests:**
   - Unit tests for `requireAdmin()` utility
   - Integration tests for admin routes
   - Tests to verify non-admin users cannot access admin routes

---

## Implementation Examples

### Fix for Missing Admin Checks

**Before:**

```javascript
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**After:**

```javascript
import { requireAdmin } from "@/utils/auth";

export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const users = await prisma.user.findMany();
    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Fix for Server Actions

**Option 1: Check at route level (Recommended)**

```javascript
// Route file
export async function POST(request) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const data = await request.json();
    const result = await createCourse(data, adminResult.user.id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// Server action (no auth check needed)
export async function createCourse(data, userId) {
  // ... business logic only
}
```

**Option 2: Create admin wrapper for server actions**

```javascript
// New utility: src/utils/serverAuth.js
export async function requireAdminForAction() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Authentication required");
  }
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "OPERATIONS") {
    throw new Error("Unauthorized - Admin access required");
  }
  return user;
}

// Server action
export async function createCourse(data) {
  await requireAdminForAction(); // Throws if not admin
  // ... rest of logic
}
```

---

## Files Requiring Changes

### Critical (Security Issues)

1. `src/app/api/admin/users/points/route.js`
2. `src/app/api/admin/courses/upload/route.js`
3. `src/app/api/admin/upload/route.js`
4. `src/app/api/admin/audit-logs/route.js` (POST method)

### High Priority (Standardization)

5. `src/lib/actions/settings.js`
6. `src/app/api/admin/courses/actions.js`
7. `src/app/api/admin/courses/create/route.js`
8. `src/app/api/admin/settings/route.js`

---

**Report Generated:** January 2025  
**Next Steps:** Fix critical security issues immediately, then standardize remaining patterns
