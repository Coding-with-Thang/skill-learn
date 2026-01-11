# Configure Clerk Session Token to Include Super Admin Role

## The Problem

Clerk doesn't automatically include `publicMetadata` in session tokens. This means even if you add `role: "super_admin"` to a user's public metadata, it won't be available in `sessionClaims` in your middleware.

## The Solution: Custom Session Token Claims

Configure Clerk to include the role in the session token automatically.

---

## Step-by-Step Configuration

### Step 1: Go to Clerk Dashboard

1. Visit: https://dashboard.clerk.com
2. Select your application

### Step 2: Navigate to Sessions

1. Click **Sessions** in the sidebar
2. Or go to: **Configure** → **Sessions**

### Step 3: Add Custom Session Token Claims

1. Scroll to **Custom session token claims** section
2. Click **Add claim** or **Edit** (if claims already exist)

### Step 4: Add the Role Claims

Add these two custom claims:

**Claim 1:**
- **Name**: `role`
- **Value**: `{{user.public_metadata.role}}`

**Claim 2:**
- **Name**: `appRole`
- **Value**: `{{user.public_metadata.appRole}}`

**Full JSON format** (if using JSON editor):
```json
{
  "role": "{{user.public_metadata.role}}",
  "appRole": "{{user.public_metadata.appRole}}"
}
```

### Step 5: Save

1. Click **Save** or **Apply**
2. Changes take effect immediately for new sessions

---

## How It Works

After configuration:

1. **User signs in** → Clerk creates session token
2. **Session token includes** → `role` and `appRole` from `publicMetadata`
3. **Middleware can access** → `sessionClaims.role` or `sessionClaims.appRole`
4. **No API calls needed** → Everything is in the session token

---

## Accessing in Code

After configuration, you can access the role directly:

```javascript
// In middleware
const { sessionClaims } = await auth();
const userRole = sessionClaims?.role || sessionClaims?.appRole;
const isSuperAdmin = userRole === 'super_admin';

// In API routes
const { sessionClaims } = await auth();
const userRole = sessionClaims?.role;
```

---

## Important Notes

### Session Token Size Limit

- **Browser cookie limit**: ~4KB
- **Clerk default claims**: ~2.8KB
- **Available space**: ~1.2KB for custom claims
- **Our claims**: Very small (just strings), well within limit

### Token Refresh

- **Existing sessions**: Won't update until user signs out and back in
- **New sessions**: Will include the custom claims immediately
- **Force refresh**: User must sign out and sign back in

### Fallback Behavior

If custom claims aren't configured, the middleware will:
1. Check `sessionClaims.role` (won't exist)
2. Check `sessionClaims.publicMetadata.role` (won't exist)
3. Redirect to setup guide

You can also use the `/api/check-super-admin` endpoint to verify access client-side.

---

## Verification

After configuring:

1. **Sign out** of your application
2. **Sign back in** (to get new session token)
3. **Check middleware logs** - should show:
   ```
   [CMS Middleware] User check: {
     userId: 'user_...',
     userRole: 'super_admin',
     isSuperAdmin: true
   }
   ```
4. **Access `/cms/tenants`** - should work without redirect

---

## Troubleshooting

### Issue: Role still not showing in sessionClaims

**Solutions:**
1. ✅ Verify custom claims are saved in Clerk Dashboard
2. ✅ Sign out and sign back in (critical!)
3. ✅ Check claim names match exactly: `role` and `appRole`
4. ✅ Verify user has `publicMetadata.role = "super_admin"` in Clerk Dashboard

### Issue: "Token too large" error

**Solutions:**
1. ✅ Remove unnecessary custom claims
2. ✅ Use shorter claim names
3. ✅ Store only essential data in session token

### Issue: Works in some routes but not others

**Solutions:**
1. ✅ Check if route is protected by middleware
2. ✅ Verify middleware is checking the correct claim names
3. ✅ Check browser console for errors

---

## Alternative: API Route Check

If you can't configure custom session token claims, you can use the API route:

```javascript
// Client-side check
const response = await fetch('/api/check-super-admin');
const { isSuperAdmin } = await response.json();
```

But this requires an extra API call on every check, so custom session token claims are preferred.

---

## Quick Checklist

- [ ] Go to Clerk Dashboard → Sessions
- [ ] Add custom claim: `role = {{user.public_metadata.role}}`
- [ ] Add custom claim: `appRole = {{user.public_metadata.appRole}}`
- [ ] Save changes
- [ ] User has `publicMetadata.role = "super_admin"` set
- [ ] Sign out and sign back in
- [ ] Verify middleware logs show `userRole: 'super_admin'`
- [ ] Test access to `/cms/tenants`

---

**You're all set!** After configuring this, your middleware will automatically detect super admin roles without any API calls. 🚀
