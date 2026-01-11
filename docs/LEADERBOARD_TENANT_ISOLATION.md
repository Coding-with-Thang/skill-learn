# Leaderboard Tenant Isolation

## Overview
Leaderboards are now tenant-specific, ensuring users only see rankings within their own tenant.

## Implementation

### Points Leaderboard (`/api/leaderboard/points`)
- Filters users by the current authenticated user's `tenantId`
- Returns top 100 users ranked by points within the same tenant
- If user is not authenticated or has no tenant, shows users with `tenantId: null`

### Quiz Score Leaderboard (`/api/leaderboard/quiz-score`)
- Filters users by the current authenticated user's `tenantId`
- Filters `categoryStats` by the same `tenantId` to ensure accurate scoring
- Returns top 100 users ranked by average quiz score within the same tenant
- If user is not authenticated or has no tenant, shows users with `tenantId: null`

## How It Works

1. **Authentication Check**: Uses Clerk's `auth()` to get the current user's `userId`
2. **Tenant Lookup**: Queries the database to find the user's `tenantId`
3. **Filtered Query**: All leaderboard queries filter by `tenantId` to ensure tenant isolation

## Code Changes

### `/apps/lms/app/api/leaderboard/points/route.js`
- Added `auth()` import from `@clerk/nextjs/server`
- Added tenant lookup logic
- Added `where: { tenantId }` filter to user query

### `/apps/lms/app/api/leaderboard/quiz-score/route.js`
- Added `auth()` import from `@clerk/nextjs/server`
- Added tenant lookup logic
- Added `where: { tenantId }` filter to user query
- Added `where: { tenantId }` filter to `categoryStats` nested query

## Edge Cases

1. **Unauthenticated Users**: Will see leaderboard for users with `tenantId: null` (Uncategorized tenant)
2. **Users Without Tenant**: Will see leaderboard for other users with `tenantId: null`
3. **Tenant Migration**: Users moved between tenants will see the leaderboard for their new tenant

## Performance Considerations

The schema already includes indexes for tenant-based queries:
- `@@index([tenantId])` on User model
- `@@index([tenantId, categoryId, averageScore(sort: Desc)])` on CategoryStat model

These indexes ensure efficient tenant-filtered leaderboard queries.

## Testing

To test tenant isolation:
1. Sign in as a user in Tenant A
2. View leaderboard - should only show users from Tenant A
3. Sign in as a user in Tenant B
4. View leaderboard - should only show users from Tenant B
5. Rankings should be independent between tenants
