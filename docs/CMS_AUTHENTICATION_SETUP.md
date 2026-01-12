# CMS Authentication Setup Guide

This guide explains the complete authentication flow for the CMS (Super Admin Portal).

## Overview

The CMS uses Clerk for authentication with the following security model:
- **Only super admins** can access CMS routes
- **No self-registration** as super admin - only existing super admins can promote users
- **Webhook sync** ensures Clerk and database stay in sync

## Authentication Flow

### 1. User Signs Up

```
User visits /cms/sign-up
  ↓
Clerk SignUp component
  ↓
User account created in Clerk (NO super_admin role)
  ↓
Webhook fires: user.created
  ↓
User created in database (regular user, no super admin access)
  ↓
Redirected to /cms/pending-approval
```

### 2. User Signs In

```
User visits /cms/sign-in
  ↓
Clerk SignIn component
  ↓
Middleware checks:
  1. Is user authenticated? ✅
  2. Does user have super_admin role? ❌
  ↓
If no super_admin → Redirected to home page
If super_admin → Access granted to CMS
```

### 3. Super Admin Approves User

```
Existing super admin:
  1. Uses /api/admin/approve-user endpoint
  2. OR uses Clerk Dashboard to set publicMetadata.role = "super_admin"
  ↓
Clerk metadata updated
  ↓
Webhook fires: user.updated
  ↓
Database synced (user already exists)
  ↓
User can now sign in to CMS
```

## Files Created

### 1. CMS Sign-In Page
- **Location:** `apps/cms/app/sign-in/[[...sign-in]]/page.jsx`
- **Purpose:** Clerk sign-in component for CMS
- **Features:**
  - Only allows existing super admins to sign in
  - Redirects to `/cms/tenants` after successful sign-in
  - Links to sign-up page for new users

### 2. CMS Sign-Up Page
- **Location:** `apps/cms/app/sign-up/[[...sign-up]]/page.jsx`
- **Purpose:** Allow users to create accounts (but not as super admin)
- **Features:**
  - Creates account in Clerk
  - Does NOT grant super admin access
  - Redirects to pending approval page

### 3. Pending Approval Page
- **Location:** `apps/cms/app/pending-approval/page.jsx`
- **Purpose:** Inform users they need approval
- **Features:**
  - Shows account details
  - Explains approval process
  - Links back to sign-in

### 4. User Approval API
- **Location:** `apps/cms/app/api/admin/approve-user/route.js`
- **Purpose:** Allow super admins to approve users
- **Endpoints:**
  - `POST /api/admin/approve-user` - Approve a user (requires userId or email)
  - `GET /api/admin/approve-user` - List users pending approval

### 5. Updated Webhook
- **Location:** `apps/lms/app/api/webhooks/route.js`
- **Changes:**
  - Handles `user.created` and `user.updated` events
  - Syncs email field to database
  - Logs super admin status changes
  - **Never automatically grants super_admin** - only syncs if already in Clerk metadata

## Security Features

### ✅ Multi-Layer Protection

1. **Middleware Level** (First Line)
   - Checks authentication
   - Checks `publicMetadata.role === 'super_admin'`
   - Redirects unauthorized users

2. **API Route Level** (Second Line)
   - All tenant API routes use `requireSuperAdmin()`
   - Double-checks super admin status
   - Returns 401/403 if unauthorized

3. **Webhook Level** (Data Sync)
   - Never automatically grants super_admin
   - Only syncs existing super_admin status
   - Prevents self-registration as super admin

### ✅ No Self-Registration

- Users can sign up, but they **cannot** grant themselves super admin access
- Only existing super admins can:
  - Use the approval API endpoint
  - Update Clerk metadata via Dashboard
  - Use the setup script

## Setup Steps

### Step 1: Create Your First Super Admin

Use the setup script:

```bash
node scripts/setup-super-admin.js <your-email>
```

This will:
- Find your user in Clerk
- Set `publicMetadata.role = "super_admin"`
- Allow you to sign in to CMS

### Step 2: Test Sign-In

1. Visit: `http://localhost:3000/cms/sign-in`
2. Sign in with your super admin account
3. You should be redirected to `/cms/tenants`

### Step 3: Approve Additional Users (Optional)

**Option A: Via API**
```javascript
// As a super admin, call:
POST /api/admin/approve-user
{
  "email": "newadmin@example.com"
}
```

**Option B: Via Clerk Dashboard**
1. Go to Clerk Dashboard → Users
2. Find the user
3. Set `publicMetadata.role = "super_admin"`
4. User must sign out and back in

## Route Structure

```
/cms
  ├── /sign-in          → CMS sign-in page (public)
  ├── /sign-up          → CMS sign-up page (public)
  ├── /pending-approval → Pending approval page (public)
  └── /(dashboard)      → Protected dashboard routes
      ├── /             → Dashboard home (redirects to /tenants)
      ├── /tenants      → Tenant management
      └── /billing      → Billing management
```

## Webhook Configuration

Make sure your Clerk webhook is configured to send events to:
```
https://yourdomain.com/api/webhooks
```

**Required Events:**
- `user.created`
- `user.updated`
- `user.deleted`

## Testing

### Test Sign-Up Flow

1. Visit `/cms/sign-up`
2. Create a new account
3. Should redirect to `/cms/pending-approval`
4. User should NOT be able to access `/cms/tenants`

### Test Sign-In Flow (Non-Admin)

1. Visit `/cms/sign-in`
2. Sign in with a regular user (no super_admin role)
3. Should be redirected away from CMS (middleware protection)

### Test Sign-In Flow (Super Admin)

1. Visit `/cms/sign-in`
2. Sign in with super admin account
3. Should access `/cms/tenants` successfully

## Troubleshooting

### Issue: "Unauthorized" after setting super admin

**Solution:**
- User must sign out and sign back in
- Clerk caches session claims
- New session will include updated metadata

### Issue: User can't sign up

**Check:**
- Clerk is properly configured
- Sign-up is enabled in Clerk Dashboard
- Webhook is receiving events

### Issue: Webhook not creating users

**Check:**
- Webhook secret is configured
- Webhook URL is correct in Clerk Dashboard
- Check server logs for webhook errors

## Next Steps

1. ✅ Set up your first super admin using the script
2. ✅ Test sign-in to CMS
3. ✅ Configure webhook in Clerk Dashboard
4. ✅ Test user approval flow
5. ✅ Set up additional super admins as needed

---

**Security Note:** Always use the approval API or Clerk Dashboard to promote users. Never allow self-registration as super admin.
