# Super Admin Security

## Overview

Super admin creation has been locked down to prevent unauthorized access. Only existing super admins can now create new super admins.

## Security Measures Implemented

### ✅ Disabled Mechanisms

1. **Setup Script Disabled**
   - `scripts/setup-super-admin.js` - Now exits immediately with security notice
   - Script can no longer be used to create super admins

2. **Setup Guide Locked**
   - `/cms/setup-guide` - Now shows locked message for non-admins
   - No longer provides instructions for self-registration
   - Only shows status and directs users to contact existing super admins

3. **Middleware Updated**
   - Non-admins are no longer redirected to setup-guide
   - They receive a clear "access denied" message
   - Setup-guide is now protected (requires super admin or shows locked message)

4. **Documentation Deprecated**
   - `docs/CREATE_FIRST_SUPER_ADMIN.md` - Marked as deprecated
   - `docs/QUICK_START_FIRST_SUPER_ADMIN.md` - Marked as deprecated
   - Both documents now indicate setup is complete and locked

### ✅ Secured Mechanisms

1. **Approval API** (`/api/admin/approve-user`)
   - ✅ Requires existing super admin authentication
   - ✅ Uses `requireSuperAdmin()` check
   - ✅ Only super admins can approve new super admins
   - ✅ Properly validates user existence
   - ✅ Updates Clerk metadata securely

2. **Webhook Handler**
   - ✅ Does NOT auto-approve users
   - ✅ Only syncs user data from Clerk
   - ✅ Respects existing super admin metadata
   - ✅ Logs super admin status changes for audit

## Current Workflow

### For Existing Super Admins

To add a new super admin:

1. **User signs up** for CMS access
2. **Super admin approves** via CMS interface or API:
   - Use `/api/admin/approve-user` endpoint
   - Provide `userId` or `email` of the user to promote
3. **User signs out and back in** to refresh session claims
4. **User can now access** CMS dashboard

### For Non-Admins

- Cannot access CMS routes
- Cannot use setup script
- Cannot self-register via Clerk Dashboard
- Must contact existing super admin for access

## Security Best Practices

1. **Limit Super Admin Count**
   - Only create super admins when necessary
   - Document who has super admin access
   - Regularly audit super admin list

2. **Monitor Access**
   - Check server logs for super admin promotions
   - Review Clerk Dashboard for metadata changes
   - Use audit logs to track who approved whom

3. **Protect Credentials**
   - Keep `CLERK_SECRET_KEY` secure
   - Never commit secrets to version control
   - Rotate keys if compromised

## Verification

To verify security is working:

1. **Try running setup script:**
   ```bash
   node scripts/setup-super-admin.js test@example.com
   ```
   Should exit with security notice

2. **Try accessing setup-guide as non-admin:**
   - Visit `/cms/setup-guide` without super admin role
   - Should show locked/restricted message

3. **Try accessing CMS as non-admin:**
   - Should be redirected to sign-in
   - Should not be able to access any CMS routes

4. **Verify approve-user API:**
   - Try calling without super admin authentication
   - Should return 403 Forbidden

## Recovery

If you lose access to all super admins:

1. **Contact system administrator** with database access
2. **Manually update Clerk metadata** via Clerk Dashboard
3. **Or restore from backup** that includes super admin users

**Note:** The setup script has been disabled. If you need to recover access, you'll need to:
- Have database/Clerk Dashboard access
- Manually update Clerk public metadata
- Or temporarily re-enable the script (not recommended)

## Files Modified

- ✅ `scripts/setup-super-admin.js` - Disabled
- ✅ `apps/cms/app/cms/setup-guide/page.jsx` - Locked
- ✅ `apps/cms/middleware.js` - Updated redirect logic
- ✅ `docs/CREATE_FIRST_SUPER_ADMIN.md` - Deprecated
- ✅ `docs/QUICK_START_FIRST_SUPER_ADMIN.md` - Deprecated

## API Endpoints

### Secured (Requires Super Admin)
- `POST /api/admin/approve-user` - Approve new super admin
- `GET /api/admin/approve-user` - List pending users
- All `/api/tenants/*` routes
- All `/api/tenants/*/users/*` routes

### Public (No Auth Required)
- `/cms/sign-in` - Sign in page
- `/cms/sign-up` - Sign up page
- `/cms/pending-approval` - Pending approval page

### Protected (Shows Locked Message)
- `/cms/setup-guide` - Setup guide (locked for non-admins)
