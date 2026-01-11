# Setting Up Your First Super Admin

This guide walks you through setting up your first super admin user who will have access to the CMS and can manage tenants.

## Prerequisites

1. ✅ User must have signed up in your application (exists in Clerk)
2. ✅ Clerk API keys configured in your environment
3. ✅ Database connection working

## Quick Setup (Recommended)

### Option 1: Using the Setup Script

We've created a script to automate the process:

```bash
node scripts/setup-super-admin.js <email>
```

**Example:**
```bash
node scripts/setup-super-admin.js admin@example.com
```

The script will:
- ✅ Find the user in Clerk by email
- ✅ Set their `publicMetadata.role` to `"super_admin"`
- ✅ Show you what was updated
- ✅ Provide next steps

### Option 2: Manual Setup via Clerk Dashboard

1. **Go to Clerk Dashboard**
   - Navigate to: https://dashboard.clerk.com
   - Select your application

2. **Find Your User**
   - Go to **Users** → Find the user by email
   - Click on the user to open their details

3. **Add Public Metadata**
   - Scroll to **Public metadata** section
   - Click **Edit** or **Add metadata**
   - Add the following JSON:
   ```json
   {
     "role": "super_admin",
     "appRole": "super_admin"
   }
   ```
   - Click **Save**

4. **Verify**
   - The metadata should now show `role: "super_admin"`

### Option 3: Using Clerk API (Programmatic)

If you prefer to use the Clerk API directly:

```javascript
import { clerkClient } from '@clerk/nextjs/server';

async function setupSuperAdmin(clerkUserId) {
  await clerkClient.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      role: 'super_admin',
      appRole: 'super_admin'
    }
  });
}
```

## After Setup

### 1. User Must Sign Out and Sign Back In

**Important:** The user needs to sign out and sign back in for the changes to take effect. This is because Clerk caches the session claims.

### 2. Test Access

1. Have the user sign in to your application
2. Try accessing: `http://localhost:3000/cms/tenants`
3. They should now be able to:
   - View the tenants page
   - Create, edit, and delete tenants
   - Access all CMS routes

### 3. Verify It's Working

You can verify the setup by:

**Check Clerk Metadata:**
- Go to Clerk Dashboard → Users → Select user
- Check that `publicMetadata.role` = `"super_admin"`

**Check Session Claims (in your app):**
```javascript
import { auth } from '@clerk/nextjs/server';

const { sessionClaims } = await auth();
const role = sessionClaims?.publicMetadata?.role;
console.log('User role:', role); // Should be "super_admin"
```

## Troubleshooting

### Issue: User still can't access CMS after setup

**Solutions:**
1. ✅ Make sure user signed out and signed back in
2. ✅ Verify metadata in Clerk Dashboard
3. ✅ Check browser console for errors
4. ✅ Check server logs for authentication errors

### Issue: Script says "User not found"

**Solutions:**
1. ✅ Make sure the user has signed up in your application
2. ✅ Verify the email address is correct
3. ✅ Check that Clerk API keys are configured correctly
4. ✅ Ensure the user exists in your Clerk application

### Issue: "Unauthorized" error in API

**Solutions:**
1. ✅ Check that `publicMetadata.role` is exactly `"super_admin"` (case-sensitive)
2. ✅ Verify the user signed out and back in after metadata update
3. ✅ Check middleware is reading from the correct metadata path
4. ✅ Clear browser cookies and try again

## Security Best Practices

1. **Limit Super Admins**
   - Only promote trusted users
   - Keep the number of super admins minimal

2. **Audit Trail**
   - Consider logging who was promoted to super admin
   - Track super admin actions in your audit logs

3. **2FA Required**
   - Enable 2FA requirement for super admins in Clerk
   - This adds an extra layer of security

4. **Regular Review**
   - Periodically review who has super admin access
   - Remove access for users who no longer need it

## Next Steps

Once your first super admin is set up:

1. ✅ They can access `/cms/tenants` to manage tenants
2. ✅ They can create, edit, and delete tenants
3. ✅ They can manage the multi-tenant system
4. ✅ Consider setting up additional super admins as needed

## Additional Resources

- [Clerk Public Metadata Documentation](https://clerk.com/docs/users/metadata)
- [Super Admin Implementation Guide](./SUPER_ADMIN_CLERK_IMPLEMENTATION.md)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)

---

**Need Help?** If you encounter issues, check:
1. Clerk Dashboard → Users → Metadata
2. Server logs for authentication errors
3. Browser console for client-side errors
