# How to Access CMS in Development

## Quick Access Guide

### Step 1: Start Development Servers

The CMS runs as a **separate Next.js app** on a different port:

```bash
# From project root - starts both LMS and CMS
npm run dev

# Or start individually:
# LMS runs on port 3000
cd apps/lms && npm run dev

# CMS runs on port 3001
cd apps/cms && npm run dev
```

### Step 2: Access the CMS Sign-In Page

**Important**: CMS runs on **port 3001**, not 3000!

Navigate to:
```
http://localhost:3001/cms/sign-in
```

**Note**: If you're already signed into the LMS app (port 3000), you can still access CMS on port 3001. The CMS will:
- Detect if you're already authenticated
- Check if you have super admin privileges
- Redirect you to the dashboard if you're already a super admin
- Show an appropriate message if you're signed in but not a super admin

### Step 2: Set Up Your First Super Admin

Since the setup script is disabled for security, you have two options:

#### Option A: Using Clerk Dashboard (Recommended for Development)

1. **Sign up or sign in** to your application first (create a regular account)
2. **Go to Clerk Dashboard**: https://dashboard.clerk.com
3. **Navigate to Users** → Find your user account
4. **Click on your user** → Go to "Metadata" tab
5. **Add Public Metadata**:
   ```json
   {
     "role": "super_admin",
     "appRole": "super_admin"
   }
   ```
6. **Save the changes**
7. **Sign out and sign back in** to refresh your session
8. **Navigate to** `http://localhost:3001/cms/sign-in` and sign in

#### Option B: Using Clerk API (For Development Only)

If you need to programmatically set up super admin, you can create a temporary script:

```javascript
// scripts/dev-setup-super-admin.js
import { clerkClient } from '@clerk/nextjs/server';

async function setupSuperAdmin(email) {
  const client = await clerkClient();
  
  // Find user by email
  const users = await client.users.getUserList({
    emailAddress: [email],
  });
  
  if (users.length === 0) {
    console.error('User not found');
    return;
  }
  
  const user = users[0];
  
  // Update metadata
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: {
      ...user.publicMetadata,
      role: 'super_admin',
      appRole: 'super_admin',
    },
  });
  
  console.log(`✅ Super admin access granted to ${email}`);
}

// Run: node scripts/dev-setup-super-admin.js your-email@example.com
setupSuperAdmin(process.argv[2]);
```

### Step 3: Verify Access

1. **Check your super admin status**:
   ```
   http://localhost:3001/api/check-super-admin
   ```
   Should return: `{ "isSuperAdmin": true }`

2. **Access CMS Dashboard**:
   ```
   http://localhost:3001/cms
   ```
   or
   ```
   http://localhost:3001/cms/tenants
   ```
   
   **Note**: CMS runs on port 3001, not 3000!

## CMS Routes

Once authenticated as super admin, you can access (all on **port 3001**):

- **Dashboard**: `http://localhost:3001/cms` or `http://localhost:3001/cms/tenants`
- **Tenants Management**: `http://localhost:3001/cms/tenants`
- **Tenant Details**: `http://localhost:3001/cms/tenants/[tenantId]`
- **Roles & Permissions**: `http://localhost:3001/cms/roles-permissions`
- **Features**: `http://localhost:3001/cms/features`
- **Billing**: `http://localhost:3001/cms/billing`
- **Analytics**: `http://localhost:3001/cms/analytics`
- **System Health**: `http://localhost:3001/cms/system`
- **Admin Users**: `http://localhost:3001/cms/admins`
- **Support**: `http://localhost:3001/cms/support`
- **Announcements**: `http://localhost:3001/cms/announcements`
- **Settings**: `http://localhost:3001/cms/settings`

## Troubleshooting

### Issue: 404 Error on `/cms/sign-in`

**Solution**: You're accessing CMS on the wrong port!

- ❌ **Wrong**: `http://localhost:3000/cms/sign-in` (LMS app - doesn't have CMS routes)
- ✅ **Correct**: `http://localhost:3001/cms/sign-in` (CMS app)

Make sure the CMS app is running:
```bash
cd apps/cms && npm run dev
```

### Issue: "Access Denied" or Redirected to Sign-In

**Solution**: Your user doesn't have super admin role in Clerk.

1. Check Clerk Dashboard → Users → Your User → Metadata
2. Ensure `publicMetadata.role = "super_admin"` is set
3. Sign out and sign back in to refresh session claims

### Issue: Already Signed In But Can't Access CMS

**Solution**: The CMS sign-in page now handles this automatically:

1. If you're signed in and are a super admin → automatically redirects to dashboard
2. If you're signed in but NOT a super admin → shows a message with options to sign out or go to LMS
3. If you're not signed in → shows the sign-in form

### Issue: "Super admin access required" Error

**Solution**: The middleware is checking for the role. Verify:

1. Your Clerk environment variables are set correctly
2. Your user has the correct metadata in Clerk
3. You've signed out and back in after setting metadata

### Issue: Can't Find User in Clerk Dashboard

**Solution**: 
1. Make sure you've signed up/signed in at least once
2. Check the correct Clerk application instance
3. Verify your email matches the one used to sign up

## Development Tips

1. **Session Refresh**: After updating Clerk metadata, always sign out and sign back in
2. **Check Status**: Use `/api/check-super-admin` to verify your access
3. **Multiple Users**: You can set multiple users as super admin for development
4. **Environment**: Make sure you're using the correct Clerk environment (development vs production)

## Security Note

⚠️ **For Production**: Never use development scripts or manual metadata updates. Always use the proper approval workflow through existing super admins.
