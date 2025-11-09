# Implementation Example: Separating Landing Page and Home Page

This document shows how to refactor your current single-page implementation into separate landing and home pages.

## Current Implementation (page.jsx)
Your current `page.jsx` uses conditional rendering with `<SignedIn>` and `<SignedOut>` components.

## Recommended Refactor

### Step 1: Update Middleware

```javascript
// middleware.js (update existing)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "@/middleware/rateLimit";
import { protectedRoutes, rateLimits } from "@/config/routes";

const isProtectedRoute = createRouteMatcher(protectedRoutes);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Get IP address from headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";

    // Apply rate limiting
    const rateLimit = isProtectedRoute(req)
      ? rateLimits.protected
      : rateLimits.public;
    const rateLimitResult = await rateLimiter(ip, rateLimit);

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimitResult.retryAfter.toString(),
          },
        }
      );
    }

    // NEW: Redirect authenticated users from landing to home
    if (userId && pathname === '/') {
      return NextResponse.redirect(new URL('/home', req.url));
    }

    // NEW: Redirect unauthenticated users from home to landing
    if (!userId && pathname === '/home') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check authentication for protected routes
    if (!userId && isProtectedRoute(req)) {
      console.log("Middleware - Unauthorized access to protected route");
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized - Please sign in" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }

  return NextResponse.next();
});
```

### Step 2: Create Landing Page (Public)

```jsx
// src/app/page.jsx (Landing Page - Public)
"use client"

import { SignedOut } from '@clerk/nextjs'
import { useState } from 'react';
import HeroBanner from "./components/User/HeroBanner";
import Features from './components/User/Features';
import HowItWorks from './components/User/HowItWorks';
import Testimonials from './components/User/Testimonials';
import { LoadingPage } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function LandingPage() {
  const { isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState(null);

  // Redirect if already signed in (client-side fallback)
  if (isLoaded && user) {
    router.push('/home');
    return null;
  }

  if (!isLoaded) {
    return (
      <>
        <LoadingPage />
      </>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorCard
          error={error}
          message="Failed to load landing page"
          reset={() => setError(null)}
        />
      </main>
    );
  }

  const renderSection = (Component, props = {}) => {
    try {
      return <Component {...props} />;
    } catch (err) {
      console.error(`Failed to render ${Component.name}:`, err);
      return (
        <ErrorCard
          error={err}
          message={`Failed to load ${Component.name}`}
        />
      );
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="w-screen mb-4 overflow-x-hidden">
        {renderSection(HeroBanner)}
      </section>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 min-h-[80dvh] flex flex-col gap-8">
        <section className="w-full max-w-3xl mx-auto grid grid-cols-1 gap-6 px-2 sm:px-4 md:px-8">
          {renderSection(Features)}
          {renderSection(HowItWorks)}
          {renderSection(Testimonials)}
        </section>
      </main>
    </>
  );
}
```

### Step 3: Create Home Page (Authenticated)

```jsx
// src/app/home/page.jsx (Home Page - Authenticated)
"use client"

import { SignedIn, useUser } from '@clerk/nextjs'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DailyActivities from "../components/User/DailyActivities";
import MoreTraining from "../components/User/Training";
import PerformanceLanding from "../components/User/PerformanceLanding";
import LeaderboardLanding from "../components/User/LeaderboardLanding";
import UserBadge from '../components/User/UserBadge';
import { LoadingPage } from "@/components/ui/loading"
import { LoadingHeader } from "@/components/ui/loading"
import { ErrorCard } from "@/components/ui/error-boundary"

export default function HomePage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [error, setError] = useState(null);

  // Redirect if not signed in (client-side fallback)
  if (isLoaded && !user) {
    router.push('/');
    return null;
  }

  if (!isLoaded) {
    return (
      <>
        <LoadingHeader />
        <LoadingPage />
      </>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorCard
          error={error}
          message="Failed to load homepage"
          reset={() => setError(null)}
        />
      </main>
    );
  }

  const renderSection = (Component, props = {}) => {
    try {
      return <Component {...props} />;
    } catch (err) {
      console.error(`Failed to render ${Component.name}:`, err);
      return (
        <ErrorCard
          error={err}
          message={`Failed to load ${Component.name}`}
        />
      );
    }
  };

  return (
    <SignedIn>
      <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 min-h-[80dvh] flex flex-col gap-8">
        {/* Hero Section for logged-in users */}
        <section className="w-full mt-8 mb-6 p-8 rounded-3xl shadow-2xl bg-white/90 flex flex-col md:flex-row items-center gap-8 border border-green-200">
          <div className="flex-1 flex flex-col items-center md:items-start">
            {renderSection(UserBadge)}
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 gap-6">
              {renderSection(DailyActivities)}
              {renderSection(MoreTraining)}
            </div>
          </div>
        </section>

        {/* Dashboard Widgets */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-100">
            {renderSection(PerformanceLanding)}
          </div>
          <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-gray-100">
            {renderSection(LeaderboardLanding)}
          </div>
        </section>
      </main>
    </SignedIn>
  );
}
```

### Step 4: Update Sign-In Redirect

```jsx
// src/app/sign-in/[[...sign-in]]/page.jsx
"use client"

import { SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="flex bg-gray-100">
      {/* Hero Banner */}
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/hero-image.jpg')" }} />

      {/* Sign In Form */}
      <div className="w-1/2 flex justify-center items-center px-8 py-12 bg-white shadow-md">
        <SignIn 
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/home"  // NEW: Redirect to /home instead of /
          afterSignUpUrl="/home"   // NEW: Redirect to /home after sign up
        />
      </div>
    </div>
  )
}
```

### Step 5: Update Sign-Up Redirect

```jsx
// src/app/sign-up/[[...sign-up]]/page.jsx (if exists)
"use client"

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex bg-gray-100">
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/hero-image.jpg')" }} />
      <div className="w-1/2 flex justify-center items-center px-8 py-12 bg-white shadow-md">
        <SignUp 
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignInUrl="/home"  // NEW: Redirect to /home
          afterSignUpUrl="/home"  // NEW: Redirect to /home
        />
      </div>
    </div>
  )
}
```

### Step 6: Update Clerk Configuration (Optional)

If you have a Clerk configuration file, update redirect URLs:

```javascript
// .env.local or Clerk Dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

## Benefits of This Approach

1. **Better SEO**: Landing page and home page have different URLs and can be optimized separately
2. **Cleaner Code**: Separation of concerns - marketing vs application logic
3. **Better Performance**: Smaller bundles, can optimize each page independently
4. **Better Analytics**: Track landing page conversions and home page engagement separately
5. **Easier Testing**: Test landing page and home page independently
6. **Better UX**: No flash of wrong content, cleaner redirects

## Migration Steps

1. **Create `/home/page.jsx`** with authenticated content
2. **Update `page.jsx`** to only show landing page content
3. **Update `middleware.js`** to handle redirects
4. **Update sign-in/sign-up pages** to redirect to `/home`
5. **Test thoroughly**: Ensure all redirects work correctly
6. **Update any hardcoded links** that point to `/` for authenticated users
7. **Update analytics** to track `/` and `/home` separately

## Alternative: Keep Current Structure but Optimize

If you prefer to keep the single-page approach, you can optimize it:

```jsx
// src/app/page.jsx (Optimized version)
"use client"

import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import { useState, lazy, Suspense } from 'react';
import { LoadingPage } from "@/components/ui/loading"

// Lazy load components for better code splitting
const LandingPageContent = lazy(() => import('./components/LandingPageContent'));
const HomePageContent = lazy(() => import('./components/HomePageContent'));

export default function HomePage() {
  const { isLoaded } = useUser();
  const [error, setError] = useState(null);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorCard error={error} message="Failed to load" />;
  }

  return (
    <>
      <SignedOut>
        <Suspense fallback={<LoadingPage />}>
          <LandingPageContent />
        </Suspense>
      </SignedOut>
      <SignedIn>
        <Suspense fallback={<LoadingPage />}>
          <HomePageContent />
        </Suspense>
      </SignedIn>
    </>
  );
}
```

This approach uses code splitting to load only the necessary components for each user type.

## Recommendation

**Go with separate routes** (`/` for landing, `/home` for authenticated users) for better:
- SEO
- Performance
- Maintainability
- Analytics
- User experience

