# Creating Your First Super Admin

Since you currently have **no super admins**, you need to bootstrap the first one. Here are your options:

## 🚀 Method 1: Using the Setup Script (Recommended)

### Prerequisites

1. **User must exist in Clerk**
   - The user must have signed up in your application at least once
   - They should exist in your Clerk Dashboard

2. **Environment Variables**
   - `CLERK_SECRET_KEY` must be set in your `.env` file
   - `MONGODB_URI` must be set in your `.env` file

### Steps

1. **Find a user's email** who has signed up in your app
   - Check Clerk Dashboard → Users
   - Or check your database for existing users

2. **Run the setup script:**
   ```bash
   node scripts/setup-super-admin.js <email>
   ```

   **Example:**
   ```bash
   node scripts/setup-super-admin.js admin@example.com
   ```

3. **The script will:**
   - ✅ Find the user in Clerk
   - ✅ Set their `publicMetadata.role = "super_admin"`
   - ✅ Show you what was updated

4. **User must sign out and sign back in**
   - Clerk caches session claims
   - New session will include the updated metadata

5. **Test access:**
   - Visit: `http://localhost:3000/cms/sign-in`
   - Sign in with the promoted user
   - Should redirect to `/cms/tenants`

---

## 🎯 Method 2: Using Clerk Dashboard (Alternative)

If the script doesn't work, use Clerk Dashboard directly:

### Steps

1. **Go to Clerk Dashboard**
   - Navigate to: https://dashboard.clerk.com
   - Select your application

2. **Find Your User**
   - Go to **Users** → Find the user by email
   - Click on the user to open their details

3. **Add Public Metadata**
   - Scroll to **Public metadata** section
   - Click **Edit** or **Add metadata**
   - Add this JSON:
   ```json
   {
     "role": "super_admin",
     "appRole": "super_admin"
   }
   ```
   - Click **Save**

4. **User must sign out and sign back in**

5. **Test access:**
   - Visit: `http://localhost:3000/cms/sign-in`
   - Sign in with the user
   - Should now have access

---

## 🔧 Method 3: Create User First (If No Users Exist)

If you don't have any users yet:

### Option A: Sign Up via Your App

1. Visit your application's sign-up page
2. Create an account
3. Then use Method 1 or 2 above to promote them

### Option B: Create User via Clerk Dashboard

1. Go to Clerk Dashboard → Users
2. Click **Create User**
3. Fill in user details
4. Create the user
5. Then use Method 2 above to add super_admin metadata

### Option C: Create User via API (Programmatic)

You can create a user programmatically, but this requires:
- Clerk API access
- User creation endpoint

Then promote them using Method 1 or 2.

---

## ✅ Verification

After setting up your first super admin, verify it works:

1. **Check Clerk Metadata:**
   ```bash
   # User should have in Clerk Dashboard:
   publicMetadata.role = "super_admin"
   ```

2. **Test Sign-In:**
   - Visit: `/cms/sign-in`
   - Sign in with the user
   - Should successfully access CMS

3. **Test API Access:**
   - Try accessing `/api/tenants`
   - Should return tenant data (not 403)

---

## 🐛 Troubleshooting

### Issue: Script says "User not found"

**Solutions:**
1. ✅ Make sure the user has signed up in your application
2. ✅ Verify the email address is correct (check Clerk Dashboard)
3. ✅ Check that `CLERK_SECRET_KEY` is set correctly
4. ✅ Ensure you're using the correct Clerk application

### Issue: "CLERK_SECRET_KEY is not set"

**Solution:**
1. Get your secret key from Clerk Dashboard → API Keys
2. Add to `.env` file:
   ```
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Restart your terminal/script

### Issue: User still can't access CMS after setup

**Solutions:**
1. ✅ **User must sign out and sign back in** (critical!)
2. ✅ Verify metadata in Clerk Dashboard shows `role: "super_admin"`
3. ✅ Clear browser cookies and try again
4. ✅ Check server logs for authentication errors

### Issue: Script fails with import errors

**Solutions:**
1. Make sure you're running from the project root
2. Ensure all dependencies are installed: `npm install`
3. Try using Clerk Dashboard method instead (Method 2)

---

## 📋 Quick Checklist

- [ ] User exists in Clerk (has signed up)
- [ ] `CLERK_SECRET_KEY` is set in `.env`
- [ ] `MONGODB_URI` is set in `.env`
- [ ] Run setup script OR update Clerk Dashboard
- [ ] User signs out and signs back in
- [ ] Test access to `/cms/sign-in`
- [ ] Verify can access `/cms/tenants`

---

## 🎉 Success!

Once your first super admin is set up:

1. ✅ They can access all CMS routes
2. ✅ They can manage tenants
3. ✅ They can approve other users via `/api/admin/approve-user`
4. ✅ They can create additional super admins

**Remember:** Only existing super admins can create new super admins. This prevents unauthorized access.

---

## Next Steps After First Super Admin

1. **Set up additional super admins** (if needed)
   - Use the approval API: `POST /api/admin/approve-user`
   - Or use Clerk Dashboard
   - Or run the setup script again

2. **Configure webhook** (if not already done)
   - Point to: `https://yourdomain.com/api/webhooks`
   - This keeps Clerk and database in sync

3. **Test the full flow:**
   - Sign up a new user
   - Approve them as super admin
   - Verify they can access CMS
