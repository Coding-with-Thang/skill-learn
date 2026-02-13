# CMS Authentication Setup Guide

This guide explains the complete authentication flow for the CMS (Super Admin Portal).

## Overview

The CMS uses Clerk for authentication with the following security model:

- **Only super admins** can access CMS routes
- **No self-registration** as super admin - only existing super admins can promote users
- **Webhook sync** ensures Clerk and database stay in sync

## Authentication Flow

### 1. User Signs In (Existing Super Admin Only)

```
User visits /cms/sign-in
  ↓
Clerk SignIn component
  ↓
Must have super_admin role (set by another super admin from within CMS)
  ↓
Access granted to CMS
```

**Note:** There is no sign-up option for CMS. New super admins are created from within the CMS by an existing super admin (see section 3).

### 2. User Signs In (Flow)

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

### 3. Creating New Super Admins (From Within CMS)

```
Existing super admin (signed in to CMS):
  1. Goes to /cms/admins
  2. Clicks "Add Super Admin"
  3. Enters email of user who already has an account (e.g. from LMS sign-up)
  4. Clicks "Promote to Super Admin"
  ↓
API updates Clerk metadata (role: super_admin)
  ↓
User signs out and back in → can now access CMS
```

The promoted user must already have a Clerk account (e.g. from signing up on the LMS).

## Files Created

### 1. CMS Sign-In Page

- **Location:** `apps/cms/app/cms/sign-in/[[...sign-in]]/page.tsx`
- **Purpose:** Clerk sign-in component for CMS
- **Features:**
  - Only allows existing super admins to sign in
  - Redirects to `/cms/tenants` after successful sign-in
  - No sign-up link (super admins are created from within CMS)

### 2. Updated Webhook

- **Location:** `apps/lms/app/api/webhooks/route.ts`
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

- No self-registration for CMS; `/cms/sign-up` redirects to sign-in
- Only existing super admins can create new super admins (via CMS Admins page or Clerk Dashboard)

## Setup Steps

### Step 1: Create Your First Super Admin

Use a one-off setup script to set super admin in Clerk. The script is not in the repo; see **CMS_ACCESS_DEVELOPMENT.md** for a copy-paste example you can save as `scripts/setup-super-admin.js` and run with:

```bash
node scripts/setup-super-admin.js <your-email>
```

That will:

- Find your user in Clerk
- Set `publicMetadata.role = "super_admin"`
- Allow you to sign in to CMS

### Step 2: Test Sign-In

1. Visit: `http://localhost:3001/cms/sign-in`
2. Sign in with your super admin account
3. You should be redirected to `/cms/tenants`

### Step 3: Add Additional Super Admins (Optional)

**From within CMS (recommended):**

1. Sign in to CMS → Go to **Admins**
2. Click **Add Super Admin**
3. Enter the user's email (they must already have an account, e.g. from LMS)
4. Click **Promote to Super Admin**
5. User signs out and back in to access CMS

**Or via Clerk Dashboard:**

1. Go to Clerk Dashboard → Users → Find the user
2. Set `publicMetadata.role = "super_admin"` (and `appRole` if used)
3. User must sign out and sign back in

## Route Structure

```
/cms
  ├── /sign-in          → CMS sign-in page (public; /sign-up redirects here)
  └── /(dashboard)      → Protected dashboard routes
      ├── /admins       → Manage super admins (add new super admins)
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
2. Should redirect to `/cms/sign-in` (no sign-up option)

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
4. ✅ Add additional super admins via Clerk Dashboard as needed

---

**Security Note:** Grant super admin only via Clerk Dashboard (public metadata). Never allow self-registration as super admin.
