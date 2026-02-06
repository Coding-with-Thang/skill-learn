# Where Super Admin is Stored

## Overview

Super admin status is stored in **Clerk's user metadata**, specifically in the `publicMetadata.role` field.

## Storage Location

### Primary Storage: Clerk Public Metadata

Super admin is stored in **Clerk's user public metadata**:

```json
{
  "publicMetadata": {
    "role": "super_admin",
    "appRole": "super_admin"
  }
}
```

**Location**: Clerk Dashboard → Users → [Select User] → Metadata → Public Metadata

### How to Set Super Admin

#### Option 1: Clerk Dashboard (Recommended)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users** → Find your user
3. Click on the user → Go to **"Metadata"** tab
4. Add to **Public Metadata**:
   ```json
   {
     "role": "super_admin",
     "appRole": "super_admin"
   }
   ```
5. **Save** the changes
6. **Sign out and sign back in** to refresh session claims

## How It's Checked

### 1. Middleware (`apps/cms/middleware.js`)

Checks super admin on every CMS route request:

```javascript
const { userId, sessionClaims } = await auth();
const userRole =
  sessionClaims?.role || // Custom session token claim
  sessionClaims?.appRole || // Custom session token claim
  sessionClaims?.publicMetadata?.role || // Fallback
  sessionClaims?.publicMetadata?.appRole || // Fallback
  sessionClaims?.metadata?.role; // Legacy fallback

const isSuperAdmin = userRole === "super_admin";
```

### 2. API Routes (`packages/lib/utils/utils/auth.js`)

Uses `requireSuperAdmin()` helper function:

```javascript
export async function requireSuperAdmin() {
  const { userId, sessionClaims } = await auth();

  const userRole =
    sessionClaims?.role ||
    sessionClaims?.appRole ||
    sessionClaims?.publicMetadata?.role ||
    sessionClaims?.publicMetadata?.appRole ||
    sessionClaims?.metadata?.role;

  const isSuperAdmin = userRole === "super_admin";

  if (!isSuperAdmin) {
    return NextResponse.json(
      { error: "Unauthorized - Requires super admin access" },
      { status: 403 }
    );
  }

  return { userId };
}
```

### 3. Client-Side Check (`/api/check-super-admin`)

API endpoint that can be called from client components:

```javascript
const response = await fetch("/api/check-super-admin");
const { isSuperAdmin } = await response.json();
```

## Database Storage (Optional)

**Note**: Super admin is **NOT** stored in the database by default. The system uses Clerk metadata as the source of truth.

However, if you want to sync it to the database:

1. **User Model** has a `role` field (enum: `AGENT`, `MANAGER`, `OPERATIONS`, `SUPER_ADMIN`)
2. You can sync via Clerk webhooks when `publicMetadata.role` changes
3. This is optional and mainly for audit trails or complex role hierarchies

## Session Claims

When a user signs in, Clerk includes their `publicMetadata` in the session claims. This means:

- ✅ **Fast**: No database lookup needed
- ✅ **Cached**: Session claims are cached in the JWT
- ✅ **Secure**: Server-side only (can't be tampered with client-side)

## Important Notes

1. **Session Refresh Required**: After updating metadata in Clerk Dashboard, users must **sign out and sign back in** for changes to take effect (session claims are cached in the JWT).

2. **Multiple Checks**: The system checks multiple possible locations for the role:

   - `sessionClaims.role` (if custom session token claims configured)
   - `sessionClaims.appRole` (if custom session token claims configured)
   - `sessionClaims.publicMetadata.role` (fallback)
   - `sessionClaims.publicMetadata.appRole` (fallback)
   - `sessionClaims.metadata.role` (legacy fallback)

3. **Security**: Super admin checks happen at multiple layers:
   - Middleware (first line of defense)
   - API routes (server-side validation)
   - Database queries (if synced)

## Troubleshooting

### Issue: "Access Denied" even after setting metadata

**Solution**: Sign out and sign back in. Session claims are cached in the JWT and need to be refreshed.

### Issue: Metadata not appearing in sessionClaims

**Solution**:

1. Verify metadata is set in Clerk Dashboard
2. Check if custom session token claims are configured in Clerk
3. Ensure you're checking the correct field (`role`, `appRole`, or `publicMetadata.role`)

### Issue: API returns 500 error

**Solution**: The `/api/check-super-admin` route now uses `sessionClaims` instead of making an API call to Clerk, which is more efficient and avoids errors.

## Summary

- **Storage**: Clerk `publicMetadata.role = "super_admin"`
- **Access**: Set via Clerk Dashboard (public metadata)
- **Check**: Via `sessionClaims` in middleware and API routes
- **Refresh**: Sign out/in after updating metadata
- **Database**: Optional sync via webhooks (not required)
