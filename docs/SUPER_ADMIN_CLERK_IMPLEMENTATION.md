# Super Admin Authentication with Clerk.js

## Overview

This guide explains how to implement super admin authentication for your SaaS CMS dashboard using Clerk.js in the monorepo structure.

---

## Approaches for Super Admin in Clerk.js

### Option 1: Clerk Organizations (Recommended for Multi-Tenant SaaS)

**Best for:** SaaS platforms with multiple tenants/organizations where you need organization-level admins.

```javascript
// Super admin organization
Organization: "Super Admin Org"
  - Members: [super-admin-1, super-admin-2]
  - Roles: "super_admin"
```

**Pros:**
- ✅ Built-in Clerk feature
- ✅ Organization management
- ✅ Role-based permissions
- ✅ Scales well

**Cons:**
- ⚠️ Requires organization setup

---

### Option 2: Public Metadata (Recommended for Simple SaaS)

**Best for:** Single SaaS platform where you need simple super admin check.

```javascript
// User public metadata
{
  "role": "super_admin",
  "permissions": ["*"]
}
```

**Pros:**
- ✅ Simple setup
- ✅ No organizations needed
- ✅ Easy to check
- ✅ Fast to implement

**Cons:**
- ⚠️ Manual management

---

### Option 3: Private Metadata

**Best for:** When you want to hide admin status from client-side.

```javascript
// User private metadata (server-side only)
{
  "isSuperAdmin": true,
  "adminLevel": "super"
}
```

**Pros:**
- ✅ Hidden from client
- ✅ Secure

**Cons:**
- ⚠️ Server-side only
- ⚠️ Can't check in client components

---

### Option 4: Database Role Field (Current Approach)

**Best for:** When you need complex role hierarchies stored in your database.

```javascript
// Prisma User model
model User {
  role Role @default(AGENT)  // AGENT, MANAGER, OPERATIONS, SUPER_ADMIN
}
```

**Pros:**
- ✅ Full control
- ✅ Complex hierarchies
- ✅ Database-driven
- ✅ Already implemented

**Cons:**
- ⚠️ Requires database sync
- ⚠️ Need to check both Clerk + DB

---

## Recommended Approach: Hybrid (Clerk Metadata + Database)

**For your SaaS, I recommend combining:**

1. **Clerk Public Metadata** - Quick check in middleware
2. **Database Role Field** - Complex role logic and audit trails
3. **Sync via Webhooks** - Keep them in sync

---

## Implementation Guide

### Step 1: Add SUPER_ADMIN to Database Schema

**File: `packages/database/prisma/schema.prisma`**

```prisma
enum Role {
  AGENT
  MANAGER
  OPERATIONS
  SUPER_ADMIN  // Add this
}

model User {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  clerkId         String          @unique
  username        String          @unique
  firstName       String
  lastName        String
  role            Role            @default(AGENT)
  // ... other fields
}
```

Run migration:
```bash
cd packages/database
npm run prisma:migrate
```

---

### Step 2: Set Up Clerk Public Metadata for Super Admins

**In Clerk Dashboard or via API:**

1. Go to Clerk Dashboard → Users
2. Select a super admin user
3. Add Public Metadata:
   ```json
   {
     "role": "super_admin",
     "appRole": "super_admin"
   }
   ```

**Or via API (initial setup script):**

```javascript
// scripts/setup-super-admin.js
import { clerkClient } from '@clerk/nextjs/server';

async function setupSuperAdmin(clerkUserId) {
  await clerkClient.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      role: 'super_admin',
      appRole: 'super_admin'
    }
  });
}
```

---

### Step 3: Update CMS Middleware

**File: `apps/cms/middleware.js`**

```javascript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // Protect all /cms/* routes
  if (pathname.startsWith('/cms')) {
    // Check authentication
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check super admin role from Clerk metadata
    const userRole = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;
    const isSuperAdmin = userRole === 'super_admin';

    if (!isSuperAdmin) {
      // Optional: Check database as fallback
      // const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      // if (user?.role !== 'SUPER_ADMIN') {
      //   return NextResponse.redirect(new URL('/', req.url));
      // }
      
      // For now, just redirect non-admins
      return NextResponse.redirect(new URL('/', req.url), {
        status: 403
      });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|_static|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

### Step 4: Create Super Admin Utility Functions

**File: `packages/lib/utils/auth.js`**

```javascript
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@skill-learn/database';

/**
 * Check if current user is super admin (from Clerk metadata)
 */
export async function isSuperAdmin() {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) return false;

    // Check Clerk metadata first (fastest)
    const userRole = sessionClaims?.metadata?.role || 
                     sessionClaims?.publicMetadata?.role;
    
    if (userRole === 'super_admin') {
      return true;
    }

    // Fallback: Check database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    return user?.role === 'SUPER_ADMIN';
  } catch (error) {
    console.error('Error checking super admin:', error);
    return false;
  }
}

/**
 * Require super admin - throws if not admin
 */
export async function requireSuperAdmin() {
  const isAdmin = await isSuperAdmin();
  
  if (!isAdmin) {
    return {
      error: 'Unauthorized',
      status: 403,
      message: 'Super admin access required'
    };
  }

  return { isAdmin: true };
}

/**
 * Get current user with super admin check
 */
export async function getCurrentUserWithAdminCheck() {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized', status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || 
                      await isSuperAdmin();

  return {
    user,
    isSuperAdmin
  };
}
```

---

### Step 5: Update CMS API Routes

**File: `apps/cms/app/api/tenants/route.js`**

```javascript
import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@skill-learn/lib/utils/auth';
import { prisma } from '@skill-learn/database';

export async function GET() {
  try {
    // Check super admin
    const adminCheck = await requireSuperAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.message },
        { status: adminCheck.status }
      );
    }

    // Get tenants
    const tenants = await prisma.organization.findMany({
      // ... query
    });

    return NextResponse.json({ tenants });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Step 6: Update Webhook to Sync Super Admin Role

**File: `apps/lms/app/api/webhooks/route.js`**

```javascript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@skill-learn/database';
import { NextResponse } from 'next/server';

export async function POST(req) {
  // ... webhook verification ...

  const eventType = evt.type;
  const { id, public_metadata, ...attributes } = evt.data;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    // Extract role from Clerk metadata
    const clerkRole = public_metadata?.role || public_metadata?.appRole;
    
    // Map Clerk role to database role
    let dbRole = 'AGENT'; // default
    if (clerkRole === 'super_admin') {
      dbRole = 'SUPER_ADMIN';
    } else if (clerkRole === 'operations') {
      dbRole = 'OPERATIONS';
    } else if (clerkRole === 'manager') {
      dbRole = 'MANAGER';
    }

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        firstName: attributes.first_name || '',
        lastName: attributes.last_name || '',
        imageUrl: attributes.image_url,
        role: dbRole, // Sync role from Clerk metadata
      },
      create: {
        clerkId: id,
        username: attributes.username || `user_${id}`,
        firstName: attributes.first_name || '',
        lastName: attributes.last_name || '',
        imageUrl: attributes.image_url,
        role: dbRole, // Set role from Clerk metadata
      },
    });
  }

  // ... rest of webhook handler ...
}
```

---

### Step 7: Client-Side Super Admin Check (Optional)

**File: `apps/cms/components/layout/TopBar.jsx`**

```javascript
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function TopBar() {
  const { user, isLoaded } = useUser();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (user && isLoaded) {
      // Check public metadata
      const role = user.publicMetadata?.role || user.publicMetadata?.appRole;
      setIsSuperAdmin(role === 'super_admin');
    }
  }, [user, isLoaded]);

  if (!isLoaded || !isSuperAdmin) {
    return null; // Or redirect
  }

  return (
    <header>
      <div>Super Admin: {user?.emailAddresses[0]?.emailAddress}</div>
    </header>
  );
}
```

---

### Step 8: Create Super Admin Management Script

**File: `scripts/manage-super-admin.js`**

```javascript
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@skill-learn/database';

/**
 * Promote user to super admin
 */
export async function promoteToSuperAdmin(email) {
  try {
    // Find user in Clerk
    const users = await clerkClient.users.getUserList({
      emailAddress: [email]
    });

    if (users.length === 0) {
      throw new Error(`User with email ${email} not found in Clerk`);
    }

    const clerkUser = users[0];

    // Update Clerk metadata
    await clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        role: 'super_admin',
        appRole: 'super_admin'
      }
    });

    // Update database
    await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { role: 'SUPER_ADMIN' }
    });

    console.log(`✅ Promoted ${email} to super admin`);
    return { success: true };
  } catch (error) {
    console.error('Error promoting user:', error);
    throw error;
  }
}

/**
 * Demote user from super admin
 */
export async function demoteFromSuperAdmin(email) {
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email]
    });

    if (users.length === 0) {
      throw new Error(`User with email ${email} not found`);
    }

    const clerkUser = users[0];

    // Remove super admin from Clerk
    await clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        role: 'agent',
        appRole: 'agent'
      }
    });

    // Update database
    await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { role: 'AGENT' }
    });

    console.log(`✅ Demoted ${email} from super admin`);
    return { success: true };
  } catch (error) {
    console.error('Error demoting user:', error);
    throw error;
  }
}

// CLI usage
// node scripts/manage-super-admin.js promote user@example.com
// node scripts/manage-super-admin.js demote user@example.com
```

---

## Workflow: How It Works

### 1. User Signs In

```
User → Clerk Sign In → Clerk Session Created
  ↓
Session includes publicMetadata.role = "super_admin"
```

### 2. Access CMS Route

```
User visits /cms/dashboard
  ↓
CMS Middleware checks:
  1. Is user authenticated? ✅
  2. Is user.superAdmin? ✅ (from Clerk metadata)
  ↓
Allow access to CMS
```

### 3. API Request

```
CMS makes API call to /api/tenants
  ↓
API route checks requireSuperAdmin()
  ↓
Checks Clerk metadata OR database
  ↓
Returns data if admin, 403 if not
```

### 4. Webhook Sync

```
User updated in Clerk Dashboard
  ↓
Webhook fires: user.updated
  ↓
Sync role to database
  ↓
Database and Clerk stay in sync
```

---

## Best Practices

### 1. Defense in Depth

Check super admin in **multiple layers**:

```javascript
// Layer 1: Middleware (fastest, first line)
if (!isSuperAdmin) return redirect();

// Layer 2: API route (server-side, secure)
const adminCheck = await requireSuperAdmin();
if (adminCheck.error) return error();

// Layer 3: Database queries (data-level)
const user = await prisma.user.findUnique({ where: { clerkId } });
if (user.role !== 'SUPER_ADMIN') throw error();
```

### 2. Cache Super Admin Status

```javascript
// Cache in session claims (Clerk does this automatically)
sessionClaims.publicMetadata.role // ✅ Fast, cached

// Don't hit database on every request
// Only use DB as fallback or for complex checks
```

### 3. Audit Trail

```javascript
// Log super admin actions
await prisma.auditLog.create({
  data: {
    userId: userId,
    action: 'SUPER_ADMIN_ACCESS',
    resource: '/cms/tenants',
    metadata: { ip: req.ip }
  }
});
```

### 4. Environment-Based Super Admin

```javascript
// Development: Allow all
if (process.env.NODE_ENV === 'development') {
  const devEmails = process.env.DEV_SUPER_ADMINS?.split(',') || [];
  if (devEmails.includes(userEmail)) {
    return true; // Allow
  }
}

// Production: Strict check
return userRole === 'super_admin';
```

---

## Security Considerations

### ✅ DO:

1. **Check server-side** - Never trust client-side checks
2. **Use middleware** - First line of defense
3. **Check in API routes** - Double-check server-side
4. **Audit logs** - Track all super admin actions
5. **Rate limiting** - Protect admin routes
6. **2FA required** - Require 2FA for super admins

### ❌ DON'T:

1. **Don't expose admin status client-side** (unless necessary)
2. **Don't rely only on client-side checks**
3. **Don't hardcode admin emails in code**
4. **Don't skip authentication checks**
5. **Don't log sensitive data in audit logs**

---

## Complete Example: CMS Dashboard Route

**File: `apps/cms/app/page.jsx`**

```javascript
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { isSuperAdmin } from '@skill-learn/lib/utils/auth';
import DashboardContent from '@/components/cms/dashboard/DashboardContent';

export default async function CMSDashboard() {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Check super admin
  const admin = await isSuperAdmin();
  if (!admin) {
    redirect('/');
  }

  // Render dashboard
  return <DashboardContent />;
}
```

---

## Testing Super Admin Access

### Test Script

```javascript
// scripts/test-super-admin.js
import { clerkClient } from '@clerk/nextjs/server';

async function testSuperAdmin() {
  const testEmail = 'admin@example.com';
  
  // 1. Get user
  const users = await clerkClient.users.getUserList({
    emailAddress: [testEmail]
  });
  
  const user = users[0];
  console.log('User metadata:', user.publicMetadata);
  
  // 2. Test middleware check
  // (would need to make actual request)
  
  // 3. Test API route
  // (would need to make actual request)
}
```

---

## Summary

✅ **Recommended Setup:**
- Clerk Public Metadata: `role: "super_admin"`
- Database Role Field: `SUPER_ADMIN` enum
- Sync via Webhooks
- Check in Middleware + API Routes
- Client-side check (optional, for UI)

✅ **Benefits:**
- Fast checks (Clerk metadata cached)
- Secure (server-side validation)
- Scalable (works with any number of admins)
- Maintainable (single source of truth via webhooks)

---

**Your super admin system is ready!** 🎉
