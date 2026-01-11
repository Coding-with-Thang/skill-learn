# Vercel Deployment Guide for Monorepo

This monorepo contains two Next.js applications:
- **LMS** (`apps/lms`) - Learning Management System
- **CMS** (`apps/cms`) - Content Management System

## Setup Instructions

### Option 1: Separate Vercel Projects (Recommended)

Create **two separate projects** in Vercel, one for each app:

#### For CMS:

1. **Create a new project in Vercel Dashboard**
   - Go to https://vercel.com/new
   - Import your repository
   - **Project Name**: `skill-learn-cms` (or your preferred name)

2. **Configure Project Settings**:
   - **Root Directory**: `apps/cms`
   - **Framework Preset**: Next.js
   - **Build Command**: `cd ../.. && npm run build --filter=@skill-learn/cms`
   - **Output Directory**: `.next` (leave default)
   - **Install Command**: `cd ../.. && npm install`

3. **Environment Variables**:
   Add all required environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   NODE_ENV=production
   ```

#### For LMS:

1. **Create a new project in Vercel Dashboard**
   - Go to https://vercel.com/new
   - Import the same repository
   - **Project Name**: `skill-learn-lms` (or your preferred name)

2. **Configure Project Settings**:
   - **Root Directory**: `apps/lms`
   - **Framework Preset**: Next.js
   - **Build Command**: `cd ../.. && npm run build --filter=@skill-learn/lms`
   - **Output Directory**: `.next` (leave default)
   - **Install Command**: `cd ../.. && npm install`

3. **Environment Variables**:
   Add all required environment variables (same as CMS, plus any LMS-specific ones)

### Option 2: Single Project with Ignore Build Step

If you want to use a single Vercel project but deploy both apps:

1. **Create one Vercel project**
2. **Use Ignore Build Step**:
   - In Vercel project settings → General → Ignore Build Step
   - For CMS: Use `scripts/should-build-cms.sh`
   - For LMS: Use `scripts/should-build-lms.sh`

   **Note**: This approach is more complex and not recommended for production.

## Troubleshooting

### Issue: "Already deployed successfully" but wrong app

**Solution**: Make sure you have **separate Vercel projects** for CMS and LMS. If you're trying to deploy CMS but Vercel thinks it's LMS, you're likely using the wrong project.

### Issue: Build fails with "Cannot find module"

**Solution**: 
1. Make sure `Root Directory` is set to `apps/cms` (or `apps/lms`)
2. Make sure `Install Command` runs from root: `cd ../.. && npm install`
3. Make sure `Build Command` uses the filter: `cd ../.. && npm run build --filter=@skill-learn/cms`

### Issue: Environment variables not loading

**Solution**:
1. Check that all environment variables are set in Vercel project settings
2. Make sure variable names match exactly (case-sensitive)
3. Redeploy after adding new environment variables

### Issue: Build succeeds but app doesn't work

**Solution**:
1. Check Vercel function logs for runtime errors
2. Verify all environment variables are set correctly
3. Check that database connections are allowed from Vercel IPs
4. Verify Clerk webhook URLs are configured correctly

## Verification

After deployment:

1. **CMS**: Visit `https://your-cms-project.vercel.app/cms/sign-in`
2. **LMS**: Visit `https://your-lms-project.vercel.app`

Both should load without errors.

## Quick Checklist

- [ ] Created separate Vercel projects for CMS and LMS
- [ ] Set Root Directory to `apps/cms` (or `apps/lms`)
- [ ] Set Build Command to use `--filter=@skill-learn/cms` (or `lms`)
- [ ] Set Install Command to run from root
- [ ] Added all required environment variables
- [ ] Configured custom domains (if needed)
- [ ] Set up Clerk webhook URLs pointing to Vercel deployments
