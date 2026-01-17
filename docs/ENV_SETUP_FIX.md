# Environment Variables Setup Fix

## Problem

In a Next.js monorepo, Next.js looks for `.env.local` in the **app directory** (`apps/lms/.env.local`), not in the root directory. This causes Clerk to show "missing environment keys" errors even when the keys are in the root `.env.local`.

## Solution

We've created an automatic sync script that copies environment variables from the root to the app directory.

### Automatic Sync (Recommended)

The `sync:env` script now runs automatically when you start the dev server:

```bash
npm run dev
```

This will:
1. Check if `.env.local` exists in the root
2. Copy it to `apps/lms/.env.local`
3. Start the development server

### Manual Sync

If you need to sync manually:

```bash
npm run sync:env
```

### What Gets Synced

The script copies all environment variables from:
- **Source**: `.env.local` (root directory)
- **Destination**: `apps/lms/.env.local`

## Required Environment Variables

Make sure your root `.env.local` contains:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...  # Optional
MONGODB_URI=mongodb+srv://...   # Optional but recommended
```

## After Syncing

1. **Restart your dev server** if it's already running:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Clear Next.js cache** if issues persist:
   ```bash
   # Delete .next folder
   rm -rf apps/lms/.next
   # Or on Windows:
   rmdir /s apps\lms\.next
   ```

3. **Verify**:
   - Check browser console - Clerk errors should be gone
   - Try signing in - should work now

## Troubleshooting

### Still seeing "Missing environment keys"

1. **Check file exists**:
   ```bash
   # Verify root .env.local exists
   cat .env.local
   
   # Verify it was copied to apps/lms
   cat apps/lms/.env.local
   ```

2. **Check variable names**:
   - Must be exactly: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (with `NEXT_PUBLIC_` prefix!)
   - Must be exactly: `CLERK_SECRET_KEY`
   - No extra spaces or quotes

3. **Restart dev server**:
   - Stop completely (Ctrl+C)
   - Run `npm run dev` again

### Username sign-in not working

If username sign-in still doesn't work after fixing env vars:

1. **Check browser console** for errors
2. **Check server logs** for API errors
3. **Verify user exists** in Clerk Dashboard
4. **Try with email** instead of username to verify Clerk is working

## Notes

- The sync script only runs when you start `npm run dev`
- If you manually edit root `.env.local`, run `npm run sync:env` to update
- The script is idempotent - safe to run multiple times
- Both files will have the same content after syncing
