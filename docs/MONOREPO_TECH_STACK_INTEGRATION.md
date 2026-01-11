# Monorepo Tech Stack Integration Guide

## Overview

This guide explains how your tech stack (Clerk.js, Prisma, Next.js, etc.) works in the monorepo structure.

---

## Clerk.js Integration

### Architecture Decision: Per-App Configuration

**Key Decision:** Each app (LMS and CMS) has its own Clerk configuration and ClerkProvider.

**Why?**

- Each app can have different authentication requirements
- Independent session management
- Different redirect URLs
- Different middleware protection rules
- Easier to manage permissions per app

---

## 1. Environment Variables

### 1.1 Root `.env` vs App `.env`

**Option A: Shared Environment Variables (Recommended)**

Create `.env.local` at the root with shared variables:

```bash
# Root .env.local
# Shared Clerk Configuration (same instance, different apps)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Shared Database
MONGODB_URI=mongodb://...

# Clerk Webhooks (shared secret)
CLERK_WEBHOOK_SECRET=whsec_...

# Other shared variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Option B: Per-App Environment Variables**

Each app can have its own `.env.local`:

- `apps/lms/.env.local`
- `apps/cms/.env.local`

**Recommendation:** Use Option A (root `.env.local`) since both apps use the same Clerk instance and database.

### 1.2 Environment Variable Structure

```bash
# Root .env.local

# ============================================
# Clerk Configuration (Shared)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ============================================
# Database (Shared)
# ============================================
MONGODB_URI=mongodb://...

# ============================================
# Webhooks (Shared)
# ============================================
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# App URLs (Per-App)
# ============================================
# LMS App
NEXT_PUBLIC_LMS_URL=http://localhost:3000

# CMS App
NEXT_PUBLIC_CMS_URL=http://localhost:3001
```

---

## 2. Clerk Configuration in Each App

### 2.1 LMS App Setup

**File: `apps/lms/app/layout.jsx`**

```javascript
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@skill-learn/ui/components/sonner";
import { ErrorBoundaryProvider } from "@/components/providers/ErrorBoundaryProvider";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";

// ... font configurations ...

export const metadata = {
  title: "Skill-Learn",
  description: "Gamify your knowledge - have a blast learning",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
    // Optional: Customize appearance
    // appearance={{
    //   baseTheme: dark
    // }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body
          className={`${inter.variable} ${mono.variable} ${poppins.variable} font-sans antialiased flex flex-col min-h-screen`}
        >
          <ErrorBoundaryProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster />
          </ErrorBoundaryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**File: `apps/lms/middleware.js`**

```javascript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "@skill-learn/lib/utils/rateLimit";
import { publicRoutes, rateLimits } from "@/config/routes";

const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Handle redirects for landing page and home page
    if (userId && pathname === "/") {
      const homeUrl = new URL("/home", req.url);
      return NextResponse.redirect(homeUrl);
    }

    if (!userId && pathname === "/home") {
      const landingUrl = new URL("/", req.url);
      return NextResponse.redirect(landingUrl);
    }

    // ... rate limiting and auth protection ...

    if (isProtected) {
      await auth.protect();
    }
  } catch (error) {
    // ... error handling ...
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### 2.2 CMS App Setup

**File: `apps/cms/app/layout.jsx`**

```javascript
import { ClerkProvider } from "@clerk/nextjs";
import DashboardLayout from "@/components/cms/layout/DashboardLayout";
import "./globals.css";

export const metadata = {
  title: "Skill-Learn - Super Admin Dashboard",
  description: "Multi-tenant Learning Management System Super Admin Dashboard",
};

export default function CMSLayout({ children }) {
  return (
    <ClerkProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ClerkProvider>
  );
}
```

**File: `apps/cms/middleware.js`**

```javascript
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // Protect all /cms/* routes
  if (pathname.startsWith("/cms")) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // TODO: Check for super admin role
    // const { orgRole } = await auth();
    // if (orgRole !== 'super_admin') {
    //   return NextResponse.redirect(new URL('/', req.url));
    // }
  }
});

export const config = {
  matcher: ["/((?!_next|_static|favicon.ico).*)", "/"],
};
```

---

## 3. Shared Clerk Utilities

### 3.1 Clerk Helper Functions (packages/lib)

**File: `packages/lib/utils/clerk.js`**

```javascript
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Get user by Clerk ID
 */
export async function getClerkUser(clerkId) {
  try {
    const user = await clerkClient.users.getUser(clerkId);
    return user;
  } catch (error) {
    console.error("Error fetching Clerk user:", error);
    throw error;
  }
}

/**
 * Update Clerk user
 */
export async function updateClerkUser(clerkId, data) {
  try {
    const user = await clerkClient.users.updateUser(clerkId, data);
    return user;
  } catch (error) {
    console.error("Error updating Clerk user:", error);
    throw error;
  }
}

/**
 * Delete Clerk user
 */
export async function deleteClerkUser(clerkId) {
  try {
    await clerkClient.users.deleteUser(clerkId);
  } catch (error) {
    console.error("Error deleting Clerk user:", error);
    throw error;
  }
}

// ... other Clerk utility functions ...
```

**Usage in Apps:**

```javascript
// In apps/lms/app/api/users/route.js
import { updateClerkUser, deleteClerkUser } from "@skill-learn/lib/utils/clerk";

export async function PUT(request) {
  // ... use updateClerkUser ...
}

export async function DELETE(request) {
  // ... use deleteClerkUser ...
}
```

---

## 4. Clerk Webhooks

### 4.1 Webhook Route Location

**Decision:** Keep webhooks in the LMS app (since it handles user management)

**File: `apps/lms/app/api/webhooks/route.js`**

```javascript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@skill-learn/database";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Create user in database
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url,
      },
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Update user in database
    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0].email_address,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url,
      },
    });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Delete user from database
    await prisma.user.delete({
      where: { clerkId: id },
    });
  }

  return new Response("", { status: 200 });
}
```

**Webhook URL in Clerk Dashboard:**

- `http://localhost:3000/api/webhooks` (LMS app)
- Or production: `https://yourdomain.com/api/webhooks`

---

## 5. Database Integration with Clerk

### 5.1 Prisma Schema (packages/database)

The Prisma schema includes Clerk integration:

```prisma
model User {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  clerkId         String          @unique  // Links to Clerk user
  username        String          @unique
  firstName       String
  lastName        String
  imageUrl        String?
  // ... other fields ...
}
```

### 5.2 Database Access from Apps

**In LMS App:**

```javascript
// apps/lms/app/api/user/route.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return Response.json({ user });
}
```

**In CMS App:**

```javascript
// apps/cms/app/api/tenants/route.js
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

export async function GET() {
  const { userId } = await auth();

  // Check super admin role
  // ... role check ...

  const tenants = await prisma.organization.findMany({
    // ... query ...
  });

  return Response.json({ tenants });
}
```

---

## 6. Client-Side Clerk Usage

### 6.1 Using Clerk Hooks in Components

**LMS App Components:**

```javascript
// apps/lms/components/features/auth/UserButtonWrapper.jsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function UserButtonWrapper() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <UserButton afterSignOutUrl="/" />;
}
```

**CMS App Components:**

```javascript
// apps/cms/components/layout/TopBar.jsx
"use client";

import { useUser } from "@clerk/nextjs";

export default function TopBar() {
  const { user } = useUser();

  return (
    <header>
      <div>Super Admin: {user?.emailAddresses[0]?.emailAddress}</div>
    </header>
  );
}
```

---

## 7. Tech Stack Summary

### 7.1 Shared Packages

| Package                 | Purpose       | Clerk Integration               |
| ----------------------- | ------------- | ------------------------------- |
| `@skill-learn/database` | Prisma client | Links users via `clerkId`       |
| `@skill-learn/ui`       | UI components | Can include Clerk UI components |
| `@skill-learn/lib`      | Utilities     | Clerk helper functions          |

### 7.2 Per-App Configuration

| App     | Clerk Setup               | Purpose                        |
| ------- | ------------------------- | ------------------------------ |
| **LMS** | `ClerkProvider` in layout | Student/Teacher authentication |
| **CMS** | `ClerkProvider` in layout | Super admin authentication     |
| **LMS** | Middleware                | Protects LMS routes            |
| **CMS** | Middleware                | Protects `/cms/*` routes       |
| **LMS** | Webhooks                  | User sync with database        |

### 7.3 Environment Variables

| Variable                            | Scope     | Purpose               |
| ----------------------------------- | --------- | --------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Both apps | Public Clerk key      |
| `CLERK_SECRET_KEY`                  | Both apps | Server-side Clerk key |
| `CLERK_WEBHOOK_SECRET`              | LMS only  | Webhook verification  |
| `MONGODB_URI`                       | Both apps | Database connection   |

---

## 8. Best Practices

### 8.1 Authentication Flow

1. **User signs in** → Clerk handles authentication
2. **Webhook fires** → LMS app syncs user to database
3. **User accesses app** → Middleware checks auth
4. **Database queries** → Use `clerkId` to find user

### 8.2 Session Management

- **Sessions are shared** between apps (same Clerk instance)
- **User can switch** between LMS and CMS seamlessly
- **Role checking** happens in middleware/server-side

### 8.3 Security Considerations

- ✅ **Never expose** `CLERK_SECRET_KEY` client-side
- ✅ **Verify webhooks** with `CLERK_WEBHOOK_SECRET`
- ✅ **Check roles** server-side (not client-side)
- ✅ **Use middleware** for route protection

### 8.4 Development Workflow

1. Start both apps: `npm run dev` (from root)
2. LMS runs on `http://localhost:3000`
3. CMS runs on `http://localhost:3001`
4. Same Clerk instance serves both
5. User sessions work across both apps

---

## 9. Deployment Considerations

### 9.1 Environment Variables in Production

**Vercel/Netlify/etc:**

```bash
# Production environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
MONGODB_URI=mongodb+srv://...
CLERK_WEBHOOK_SECRET=whsec_...
```

### 9.2 Webhook Configuration

- **LMS App:** `https://lms.yourdomain.com/api/webhooks`
- **CMS App:** (No webhooks needed, or separate if needed)

### 9.3 Separate Deployments

If deploying apps separately:

- Each app needs its own environment variables
- Same Clerk instance (same keys)
- Same database
- Webhooks point to LMS app URL

---

## 10. Troubleshooting

### Issue: "Clerk not initialized"

**Solution:** Ensure `ClerkProvider` wraps your app in `layout.jsx`

### Issue: "Session not persisting between apps"

**Solution:** Both apps must use the same Clerk instance (same keys)

### Issue: "Webhook not working"

**Solution:**

- Check `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- Verify webhook URL is correct
- Check webhook is in LMS app (not CMS)

### Issue: "Cannot access database from package"

**Solution:** Ensure Prisma client is generated:

```bash
npm run prisma:generate
```

---

## Summary

✅ **Clerk.js works seamlessly in monorepo:**

- Shared Clerk instance (same keys)
- Per-app ClerkProvider setup
- Per-app middleware configuration
- Shared Clerk utilities in packages
- Webhooks in LMS app
- Database sync via webhooks
- Session sharing between apps

✅ **Benefits:**

- Single source of truth for users
- Consistent authentication
- Easy to manage permissions
- Scalable architecture

---

**Your monorepo structure is Clerk-ready!** 🎉
