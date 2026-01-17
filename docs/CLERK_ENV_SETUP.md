# Clerk Environment Variables Setup Guide

## Required Environment Variables

Clerk requires the following environment variables to be set in your `.env.local` file (at the root of the project):

```bash
# ============================================
# Clerk Authentication (REQUIRED)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ============================================
# Clerk Webhook (OPTIONAL but recommended)
# ============================================
CLERK_WEBHOOK_SECRET=whsec_...
```

## How to Get Your Clerk Keys

### Step 1: Create a Clerk Account
1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### Step 2: Get Your API Keys
1. In your Clerk Dashboard, go to **API Keys** (or **Configure** → **API Keys`)
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Copy Keys to `.env.local`
1. Create or edit `.env.local` in the root directory of your project
2. Add the keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

**Important Notes:**
- The publishable key **must** have the `NEXT_PUBLIC_` prefix for Next.js to expose it to the client
- Use `pk_test_` keys for development
- Use `pk_live_` keys for production
- Never commit `.env.local` to git (it's already in `.gitignore`)

## Setting Up Webhooks (Optional)

If you want to sync user data automatically when users sign up or update their profiles:

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Development: `http://localhost:3000/api/webhooks`
   - Production: `https://yourdomain.com/api/webhooks`
4. Select events to listen to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## Verifying Your Setup

After adding the environment variables:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check for errors**: The Clerk error should disappear. If you see:
   - ✅ No Clerk errors → Setup is correct!
   - ❌ "Missing environment keys" → Double-check your `.env.local` file

3. **Test sign-in**: Navigate to `/sign-in` and verify the sign-in form loads correctly

## Troubleshooting

### Error: "Clerk: Missing environment keys"
- **Cause**: Environment variables are not set or have incorrect names
- **Solution**: 
  1. Verify `.env.local` exists in the root directory
  2. Check that variable names are exactly:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (with `NEXT_PUBLIC_` prefix!)
     - `CLERK_SECRET_KEY`
  3. Restart your dev server after adding variables

### Error: "Invalid API key"
- **Cause**: The keys are incorrect or copied incorrectly
- **Solution**: 
  1. Go back to Clerk Dashboard
  2. Copy the keys again (make sure no extra spaces)
  3. Update `.env.local` and restart

### Keys Not Loading
- **Cause**: Next.js caches environment variables
- **Solution**: 
  1. Stop the dev server (Ctrl+C)
  2. Delete `.next` folder: `rm -rf .next` (or `rmdir /s .next` on Windows)
  3. Restart: `npm run dev`

## Production Setup

For production (Vercel, Netlify, etc.):

1. Add the same environment variables in your hosting platform's dashboard
2. Use **live keys** (`pk_live_` and `sk_live_`) instead of test keys
3. Update webhook URL to your production domain

## Quick Reference

| Variable | Required | Format | Example |
|----------|----------|--------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | `pk_test_...` or `pk_live_...` | `pk_test_abc123xyz` |
| `CLERK_SECRET_KEY` | ✅ Yes | `sk_test_...` or `sk_live_...` | `sk_test_def456uvw` |
| `CLERK_WEBHOOK_SECRET` | ⚠️ Optional | `whsec_...` | `whsec_ghi789rst` |

## Need Help?

- Clerk Documentation: https://clerk.com/docs
- Clerk Dashboard: https://dashboard.clerk.com
- Support: Check the Clerk Discord or support channels
