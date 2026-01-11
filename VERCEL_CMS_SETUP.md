# Quick Fix: Deploy CMS to Vercel

## The Problem
Vercel is treating CMS and LMS as the same project, so it says "already deployed" when trying to deploy CMS.

## The Solution: Create a Separate Vercel Project for CMS

### Step 1: Create New Vercel Project for CMS

1. Go to https://vercel.com/new
2. Click **"Add New..."** → **"Project"**
3. Import your repository (same repo as LMS)
4. **Important**: Give it a different name like `skill-learn-cms` or `your-app-cms`

### Step 2: Configure Project Settings

In the project settings page, configure:

**General Settings:**
- **Root Directory**: Click "Edit" and set to `apps/cms`
- **Framework Preset**: Next.js (should auto-detect)
- **Build Command**: Leave as default (or use: `npm run build`)
- **Output Directory**: `.next` (default)
- **Install Command**: `cd ../.. && npm install`

**OR use the vercel.json** (already created in `apps/cms/vercel.json`):
- Vercel will automatically use the `vercel.json` file if present
- Make sure Root Directory is set to `apps/cms` in Vercel dashboard

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```
MONGODB_URI=your_mongodb_uri
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
NODE_ENV=production
```

**Important**: Make sure to select **"Production"**, **"Preview"**, and **"Development"** for each variable.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your CMS will be available at: `https://your-cms-project.vercel.app`

## Alternative: Use Vercel CLI

If you prefer using CLI:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Navigate to CMS directory
cd apps/cms

# Link to a new Vercel project
vercel

# Follow prompts:
# - Create a new project? Yes
# - Project name? skill-learn-cms (or your choice)
# - Root directory? apps/cms
# - Deploy? Yes
```

## Verify Deployment

After deployment, visit:
- CMS: `https://your-cms-project.vercel.app/cms/sign-in`
- LMS: `https://your-lms-project.vercel.app` (your existing LMS project)

Both should work independently!

## Troubleshooting

### "Build failed: Cannot find module"
- Make sure **Root Directory** is set to `apps/cms` in Vercel dashboard
- Make sure **Install Command** is `cd ../.. && npm install`

### "Already deployed" error
- You're using the same Vercel project as LMS
- **Solution**: Create a NEW separate project for CMS (see Step 1)

### Environment variables not working
- Make sure variables are set for **Production**, **Preview**, and **Development**
- Redeploy after adding variables

## Summary

**You need TWO separate Vercel projects:**
1. One for LMS (already exists)
2. One for CMS (create new one)

Each project should have:
- Different project name
- Root Directory set to respective app folder (`apps/lms` or `apps/cms`)
- Same repository
- Same environment variables (but configured separately)
