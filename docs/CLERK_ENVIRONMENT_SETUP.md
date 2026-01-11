# Clerk Environment Variables Setup

## Quick Answer

**Yes, you need Clerk API keys for CMS and super admin functionality.**

**Yes, you can (and should) use the same Clerk keys as LMS** - both apps use the same Clerk application, so they share the same keys.

---

## Required Environment Variables

You need these environment variables in your `.env` or `.env.local` file:

```env
# Clerk API Keys (same for both LMS and CMS)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: For webhooks (LMS only)
CLERK_WEBHOOK_SECRET=whsec_...
```

---

## Step-by-Step Setup

### Step 1: Get Your Clerk API Keys

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your application

2. **Navigate to API Keys**
   - Click **API Keys** in the sidebar
   - Or go to: **Configure** → **API Keys**

3. **Copy Your Keys**
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
     - This is safe to expose client-side
     - Used by `ClerkProvider` in your apps
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)
     - **NEVER expose this client-side**
     - Used for server-side operations (middleware, API routes, webhooks)

### Step 2: Add to Environment Variables

**Option A: Root `.env.local` file (Recommended for Monorepo)**

Create or update `.env.local` in your project root:

```env
# Clerk Configuration (shared by both LMS and CMS)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Webhook secret (for LMS webhooks)
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
MONGODB_URI=mongodb+srv://...

# Other environment variables...
```

**Option B: App-specific `.env.local` files**

If you prefer app-specific files:
- `apps/lms/.env.local`
- `apps/cms/.env.local`

But you can use the same keys in both since they use the same Clerk application.

### Step 3: Restart Your Dev Server

After adding environment variables:

```bash
# Stop your current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Verify It's Working

1. **Check Terminal Output**
   - You should **NOT** see: `[Clerk]: You are running in keyless mode.`
   - If you see that, the keys aren't loaded correctly

2. **Test Sign-In**
   - Visit: `http://localhost:3001/cms/sign-in`
   - You should be able to sign in

3. **Check Debug Logs**
   - In your terminal, you should see middleware logs like:
   ```
   [CMS Middleware] User check: {
     userId: 'user_...',
     hasSessionClaims: true,
     publicMetadata: { role: 'super_admin', ... },  // Should NOT be undefined
     userRole: 'super_admin',
     isSuperAdmin: true
   }
   ```

---

## Why Same Keys for Both Apps?

Both your **LMS** and **CMS** apps use the **same Clerk application**, which means:

✅ **Same user database** - Users can sign in to both apps with the same account  
✅ **Same sessions** - Signing in to LMS also signs you into CMS  
✅ **Same metadata** - `publicMetadata` (like `super_admin` role) works in both apps  
✅ **Same API keys** - One set of keys works for both apps  

This is the **recommended setup** for a monorepo with multiple apps sharing authentication.

---

## Environment Variable Details

### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

- **Type**: Public (safe to expose)
- **Usage**: Client-side (`ClerkProvider`, sign-in components)
- **Format**: `pk_test_...` (development) or `pk_live_...` (production)
- **Required**: Yes, for both LMS and CMS

### `CLERK_SECRET_KEY`

- **Type**: Secret (never expose)
- **Usage**: Server-side (middleware, API routes, `clerkClient`)
- **Format**: `sk_test_...` (development) or `sk_live_...` (production)
- **Required**: Yes, for both LMS and CMS
- **Used by**:
  - CMS middleware (checking super admin role)
  - API routes (`requireSuperAdmin()`)
  - Webhooks (LMS)
  - Setup scripts (`setup-super-admin.js`)

### `CLERK_WEBHOOK_SECRET`

- **Type**: Secret
- **Usage**: Webhook verification (LMS only)
- **Format**: `whsec_...`
- **Required**: Only if you're using webhooks (LMS app)
- **Where to get**: Clerk Dashboard → Webhooks → Your webhook → Signing secret

---

## Troubleshooting

### Issue: "You are running in keyless mode"

**Cause**: Environment variables not set or not loaded

**Solutions**:
1. ✅ Check `.env.local` exists in project root
2. ✅ Verify variable names are correct (no typos)
3. ✅ Restart dev server after adding variables
4. ✅ Check that variables aren't in `.gitignore` (they should be, but make sure the file exists)

### Issue: `publicMetadata: undefined` in logs

**Cause**: Keys not set, or user doesn't have metadata yet

**Solutions**:
1. ✅ Make sure `CLERK_SECRET_KEY` is set
2. ✅ Restart dev server
3. ✅ Sign out and sign back in (Clerk caches sessions)
4. ✅ Verify user has metadata in Clerk Dashboard

### Issue: Can't sign in

**Cause**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` not set

**Solutions**:
1. ✅ Check `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. ✅ Restart dev server
3. ✅ Clear browser cache/cookies

### Issue: Middleware not checking roles correctly

**Cause**: `CLERK_SECRET_KEY` not set or wrong

**Solutions**:
1. ✅ Verify `CLERK_SECRET_KEY` is set correctly
2. ✅ Check it's the same key from Clerk Dashboard
3. ✅ Restart dev server

---

## Security Best Practices

1. ✅ **Never commit `.env.local`** to git (it's in `.gitignore`)
2. ✅ **Use different keys for dev/prod**:
   - Development: `pk_test_...` / `sk_test_...`
   - Production: `pk_live_...` / `sk_live_...`
3. ✅ **Never expose `CLERK_SECRET_KEY`** client-side
4. ✅ **Rotate keys** if they're accidentally exposed
5. ✅ **Use environment variables** in your hosting platform (Vercel, etc.)

---

## Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other: Check your platform's docs

2. **Use production keys**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```

3. **Update webhook URLs**:
   - Point webhooks to your production domain
   - Update `CLERK_WEBHOOK_SECRET` if needed

---

## Quick Checklist

- [ ] Created `.env.local` in project root
- [ ] Added `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Added `CLERK_SECRET_KEY`
- [ ] Restarted dev server
- [ ] Verified no "keyless mode" message
- [ ] Tested sign-in works
- [ ] Verified middleware logs show `publicMetadata`

---

## Next Steps

After setting up environment variables:

1. ✅ Set up your first super admin (see `docs/QUICK_START_FIRST_SUPER_ADMIN.md`)
2. ✅ Test CMS access
3. ✅ Configure webhooks (if using)

**You're all set!** 🚀
