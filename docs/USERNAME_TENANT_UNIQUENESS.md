# Username Uniqueness and Tenant Differentiation

## Current Architecture

### Username Uniqueness
- **Usernames are globally unique** - Both Clerk and the database enforce global username uniqueness
- Clerk does not allow two users with the same username globally
- Database schema uses `@unique` constraint on the `username` field
- This ensures no ambiguity when users sign in with their username

### Database Schema
- **Database enforces global username uniqueness** - We use `username String @unique`
- This matches Clerk's behavior and ensures consistency
- Usernames must be unique across all tenants

## How Tenant Differentiation Works

### During Sign-In Flow

1. **User enters username + password**
2. **System queries Clerk** by username
   - Clerk returns ONE user (or none) - Usernames are globally unique
3. **Clerk authenticates** the user
4. **After authentication**, system gets `clerkId` from Clerk session
5. **System looks up user in database** using `clerkId` (which is globally unique)
6. **Database returns user record** with `tenantId`
7. **System uses `tenantId`** for all subsequent data queries

### Key Point

**Usernames are globally unique** - This ensures no ambiguity during sign-in. The system can always identify which user is signing in, and then determine their tenant from the database record.

## Current Implementation

The current system works because:
1. **Usernames are globally unique** - Both Clerk and database enforce this
2. **After authentication**, system uses `clerkId` (unique) to look up user
3. **User's `tenantId` is retrieved** from database record
4. **All queries are filtered by `tenantId`** for data isolation

## Code Changes Made

1. ✅ Database schema uses `@unique` on `username` field for global uniqueness
2. ✅ User creation API checks for global username uniqueness (both Clerk and database)
3. ✅ User update API checks for global username uniqueness
4. ✅ Lookup API uses `findUnique` for username lookup
5. ✅ Manager lookup is tenant-scoped for security (but username is globally unique)
6. ✅ Onboarding checks both Clerk and database for username uniqueness

## Notes

- Manager lookups are still tenant-scoped for security reasons (to ensure managers belong to the same tenant)
- Usernames must be unique across all tenants
- This matches Clerk's behavior and ensures consistency
