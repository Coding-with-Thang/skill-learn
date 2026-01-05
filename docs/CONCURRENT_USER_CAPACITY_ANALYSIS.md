# Concurrent User Capacity Analysis

**Date:** January 2025  
**Purpose:** Assess the current SaaS application's capacity to handle active concurrent users

---

## Executive Summary

**Current Estimated Capacity: 50-200 concurrent users** (depending on deployment platform and MongoDB tier)

**Key Bottlenecks:**

1. In-memory rate limiting (doesn't scale across serverless instances)
2. No MongoDB connection pooling configuration
3. Dashboard stats query fetches ALL users (inefficient)
4. No distributed caching (Redis/Upstash)
5. Serverless function limits (timeout, memory, cold starts)

---

## Architecture Overview

### Tech Stack

- **Framework:** Next.js 15.5.9 (App Router)
- **Database:** MongoDB (via Prisma ORM)
- **Authentication:** Clerk
- **Deployment:** Likely Vercel (serverless functions)
- **Runtime:** Node.js (serverless functions)

### Current Optimizations ✅

1. **Database Indexing:** Well-indexed schema (role, points, createdAt, etc.)
2. **Request Deduplication:** Prevents duplicate concurrent API calls
3. **API Batching:** Combined endpoints (`/api/user/dashboard`, `/api/user/initial-load`)
4. **Client-side Caching:** Axios interceptors with configurable cache durations
5. **Next.js Cache Headers:** Some routes have cache-control headers

---

## Capacity Analysis by Component

### 1. Rate Limiting ⚠️ **CRITICAL BOTTLENECK**

**Current Implementation:**

- In-memory Map-based rate limiter (`src/lib/utils/rateLimit.js`)
- Public routes: 200 requests per 15 minutes per IP
- Protected routes: 120 requests per minute per IP

**Problem:**

- **In-memory rate limiting doesn't work in serverless environments**
- Each serverless function instance has its own memory
- Rate limits are not shared across instances
- Users can bypass limits by hitting different instances

**Impact:**

- Rate limiting is effectively disabled in production
- No protection against abuse
- Could lead to database overload

**Solution Required:**

- Use distributed rate limiting (Redis/Upstash)
- Or use Vercel's built-in rate limiting
- Or use Clerk's rate limiting features

**Estimated Capacity Impact:** Without proper rate limiting, the system is vulnerable to abuse

---

### 2. Database Connection Pooling ⚠️ **BOTTLENECK**

**Current Implementation:**

```javascript
// src/lib/utils/connect.js
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}
```

**Problem:**

- No explicit connection pool configuration
- Prisma defaults: ~10 connections per instance
- In serverless: Each function instance creates its own pool
- MongoDB Atlas free tier: 500 connections max
- MongoDB Atlas M0: 500 connections max
- MongoDB Atlas M10+: Scales with tier

**Capacity Calculation:**

- **Vercel Hobby:** ~10 serverless instances max
- **Vercel Pro:** Unlimited instances (auto-scales)
- **MongoDB Atlas M0 (Free):** 500 connections / 10 per instance = **~50 concurrent instances**
- **MongoDB Atlas M10:** 1000+ connections = **~100+ concurrent instances**

**Estimated Capacity:**

- **Free Tier (M0):** ~50-100 concurrent users (assuming 1-2 connections per user)
- **Paid Tier (M10+):** 200-500+ concurrent users

**Solution Required:**

```javascript
// Configure Prisma connection pool
prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URI,
    },
  },
  // MongoDB connection pool settings
  // Note: Prisma doesn't expose direct pool config, but MongoDB URI can include:
  // ?maxPoolSize=10&minPoolSize=2
});
```

---

### 3. Serverless Function Limits

**Vercel Limits (Hobby/Free):**

- **Timeout:** 10 seconds (Hobby), 60 seconds (Pro)
- **Memory:** 1024 MB
- **Cold Start:** ~1-3 seconds
- **Concurrent Executions:** Limited by plan

**Vercel Limits (Pro):**

- **Timeout:** 60 seconds (can be extended to 300s with config)
- **Memory:** Up to 3008 MB
- **Cold Start:** ~500ms-2s
- **Concurrent Executions:** Auto-scales

**Bottleneck Analysis:**

- Dashboard stats query fetches ALL users (see below)
- Some API routes may exceed 10s timeout under load
- Cold starts add latency during traffic spikes

**Estimated Capacity:**

- **Hobby:** 10-50 concurrent users (timeout limits)
- **Pro:** 100-500+ concurrent users (better scaling)

---

### 4. Database Query Performance ⚠️ **CRITICAL BOTTLENECK**

**Problem Query:**

```javascript
// src/lib/actions/dashboard.js
const allUsers = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    createdAt: true,
  },
});
```

**Issues:**

- Fetches ALL users from database (no pagination)
- Runs on every dashboard load
- Memory intensive for large user bases
- No caching

**Impact:**

- **100 users:** ~10ms query time
- **1,000 users:** ~50-100ms query time
- **10,000 users:** ~500ms-2s query time
- **100,000 users:** Could timeout or cause memory issues

**Estimated Capacity:**

- **< 1,000 users:** Acceptable performance
- **1,000-10,000 users:** Degraded performance
- **> 10,000 users:** Likely to timeout or fail

**Solution Required:**

- Add pagination or limit
- Cache dashboard stats (5-15 minutes)
- Use aggregation queries instead of fetching all users
- Consider materialized views or scheduled jobs

---

### 5. Caching Strategy

**Current Implementation:**

- Client-side caching (axios interceptors)
- Next.js cache headers (limited routes)
- No server-side distributed cache

**Limitations:**

- Client cache is per-browser (not shared)
- No Redis/Upstash for distributed caching
- Cache invalidation is manual

**Impact:**

- Database queries run on every request (for uncached routes)
- Higher database load
- Slower response times

**Estimated Capacity Impact:**

- Without distributed cache: **50-100 concurrent users**
- With Redis/Upstash: **200-500+ concurrent users**

---

## Overall Capacity Estimate

### Conservative Estimate (Current State)

**50-100 concurrent active users**

**Assumptions:**

- Vercel Hobby plan
- MongoDB Atlas M0 (free tier)
- No distributed caching
- In-memory rate limiting (ineffective)
- Dashboard query fetches all users

**Bottlenecks:**

1. Database connection pool (500 max on M0)
2. Serverless function timeout (10s on Hobby)
3. Dashboard query performance
4. No distributed rate limiting

---

### Optimistic Estimate (With Fixes)

**200-500+ concurrent active users**

**Assumptions:**

- Vercel Pro plan
- MongoDB Atlas M10+ (paid tier)
- Distributed caching (Redis/Upstash)
- Distributed rate limiting
- Optimized dashboard queries

**Improvements Needed:**

1. ✅ Fix dashboard query (pagination/caching)
2. ✅ Add distributed rate limiting
3. ✅ Add Redis/Upstash caching
4. ✅ Configure connection pooling
5. ✅ Upgrade to Vercel Pro (if needed)

---

## Recommendations for Scaling

### Priority 1: Critical Fixes (Immediate)

1. **Fix Dashboard Query**

   ```javascript
   // Use aggregation instead of fetching all users
   const totalUsers = await prisma.user.count({
     where: { username: { not: { contains: "test" } } },
   });
   ```

2. **Add Distributed Rate Limiting**

   - Use Upstash Redis (serverless-friendly)
   - Or Vercel's rate limiting
   - Or Clerk's rate limiting

3. **Add Distributed Caching**
   - Use Upstash Redis for server-side cache
   - Cache dashboard stats (5-15 minutes)
   - Cache frequently accessed data

### Priority 2: Performance Improvements

4. **Optimize Database Queries**

   - Add pagination to all list queries
   - Use aggregation queries where possible
   - Review and optimize slow queries

5. **Configure Connection Pooling**

   - Add connection pool settings to MongoDB URI
   - Monitor connection usage
   - Consider connection pooler if needed

6. **Add Monitoring**
   - Vercel Analytics
   - Database query monitoring
   - Error tracking (Sentry)

### Priority 3: Infrastructure Upgrades

7. **Upgrade MongoDB Tier**

   - M0 → M10 for better connection limits
   - Consider MongoDB Atlas Serverless (auto-scales)

8. **Upgrade Vercel Plan**

   - Hobby → Pro for better timeout limits
   - Consider Enterprise for higher limits

9. **Add CDN Caching**
   - Use Vercel Edge Network
   - Cache static assets
   - Cache API responses where appropriate

---

## Testing Recommendations

### Load Testing

1. Use tools like k6, Artillery, or Locust
2. Test with 50, 100, 200, 500 concurrent users
3. Monitor:
   - Response times
   - Error rates
   - Database connection usage
   - Serverless function timeouts
   - Memory usage

### Stress Testing

1. Identify breaking points
2. Test dashboard query with 10,000+ users
3. Test rate limiting effectiveness
4. Test cold start impact

---

## Monitoring Metrics to Track

1. **Database Metrics:**

   - Connection pool usage
   - Query execution time
   - Slow queries
   - Connection errors

2. **Serverless Metrics:**

   - Function execution time
   - Timeout errors
   - Cold start frequency
   - Memory usage

3. **Application Metrics:**

   - API response times
   - Error rates
   - Rate limit hits
   - Cache hit rates

4. **User Metrics:**
   - Concurrent active users
   - Requests per second
   - Peak traffic times

---

## Conclusion

**Current State:** The application can handle **50-100 concurrent users** with the current setup, but has several critical bottlenecks that will cause issues as it scales.

**With Optimizations:** The application can scale to **200-500+ concurrent users** with the recommended fixes.

**Key Actions:**

1. Fix dashboard query (highest priority)
2. Add distributed rate limiting
3. Add distributed caching
4. Monitor and optimize database queries
5. Upgrade infrastructure as needed

**Next Steps:**

1. Implement Priority 1 fixes
2. Set up monitoring
3. Conduct load testing
4. Iterate based on results
