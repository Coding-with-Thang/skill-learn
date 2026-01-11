# Quick Start: Create Your First Super Admin

## 🎯 The Problem

You need a super admin to access CMS, but you need a super admin to create super admins. Here's how to bootstrap the first one.

## ✅ Solution: Use Clerk Dashboard (Easiest Method)

This is the **fastest and most reliable** method since it doesn't require any scripts or environment setup.

### Step 1: Get a User Account

**Option A: If you already have users**
- Go to Clerk Dashboard → Users
- Find any user who has signed up
- Note their email address

**Option B: If you don't have users yet**
1. Visit your application's sign-up page
2. Create an account with your email
3. Complete the sign-up process

### Step 2: Promote User in Clerk Dashboard

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your application

2. **Find Your User**
   - Click **Users** in the sidebar
   - Find the user by email (from Step 1)
   - Click on the user to open their profile

3. **Add Super Admin Metadata**
   - Scroll down to **Public metadata** section
   - Click **Edit** (or **Add metadata** if empty)
   - Paste this JSON:
   ```json
   {
     "role": "super_admin",
     "appRole": "super_admin"
   }
   ```
   - Click **Save**

4. **Verify**
   - The metadata should now show:
   ```
   role: "super_admin"
   appRole: "super_admin"
   ```

### Step 3: Sign Out and Sign Back In

**Critical:** The user must sign out and sign back in for the changes to take effect.

1. Sign out of your application
2. Clear browser cookies (optional but recommended)
3. Sign back in

### Step 4: Test Access

1. Visit: `http://localhost:3000/cms/sign-in`
2. Sign in with the promoted user
3. You should be redirected to `/cms/tenants`
4. ✅ Success! You now have your first super admin

---

## 🔧 Alternative: Using the Setup Script

If you prefer using a script:

### Prerequisites

1. **Environment Variables**
   - Make sure `.env` file exists in project root
   - Add: `CLERK_SECRET_KEY=sk_test_...` (get from Clerk Dashboard)
   - Add: `MONGODB_URI=...` (your MongoDB connection string)

2. **User Must Exist**
   - User must have signed up in your application
   - They should appear in Clerk Dashboard → Users

### Run the Script

```bash
node scripts/setup-super-admin.js <your-email>
```

**Example:**
```bash
node scripts/setup-super-admin.js admin@example.com
```

### What It Does

- ✅ Finds user in Clerk by email
- ✅ Sets `publicMetadata.role = "super_admin"`
- ✅ Shows you what was updated
- ✅ Provides next steps

### After Running Script

1. **User must sign out and sign back in**
2. **Test access** to `/cms/sign-in`

---

## 🚨 Troubleshooting

### "User not found in Clerk"

**Solutions:**
- ✅ Make sure the user has signed up in your application
- ✅ Check the email address is correct
- ✅ Verify the user exists in Clerk Dashboard

### "CLERK_SECRET_KEY is not set"

**Solution:**
1. Get your secret key:
   - Clerk Dashboard → Your App → API Keys → Secret Keys
   - Copy the key (starts with `sk_test_` or `sk_live_`)

2. Add to `.env` file in project root:
   ```
   CLERK_SECRET_KEY=sk_test_...
   ```

3. Run the script again

### "User still can't access CMS"

**Solutions:**
1. ✅ **User must sign out and sign back in** (most common issue!)
2. ✅ Verify metadata in Clerk Dashboard shows `role: "super_admin"`
3. ✅ Clear browser cookies
4. ✅ Check browser console for errors
5. ✅ Check server logs

### Script fails with import errors

**Solutions:**
1. Make sure you're in the project root directory
2. Run `npm install` to ensure dependencies are installed
3. Use Clerk Dashboard method instead (it's easier!)

---

## 📋 Checklist

Before you start:
- [ ] User has signed up in your application
- [ ] User exists in Clerk Dashboard
- [ ] You have access to Clerk Dashboard

After setup:
- [ ] Metadata shows `role: "super_admin"` in Clerk
- [ ] User signed out and signed back in
- [ ] Can access `/cms/sign-in`
- [ ] Can access `/cms/tenants`

---

## 🎉 Success Indicators

You'll know it worked when:
- ✅ You can sign in at `/cms/sign-in`
- ✅ You're redirected to `/cms/tenants` (not blocked)
- ✅ You can see the tenants page
- ✅ You can create/edit/delete tenants

---

## 💡 Pro Tips

1. **Use Clerk Dashboard method** - It's the most reliable
2. **Always sign out/in after changes** - Clerk caches session claims
3. **Keep your first super admin secure** - This is your bootstrap account
4. **Document who has super admin access** - For security audits

---

## Next Steps

Once you have your first super admin:

1. ✅ Access CMS and manage tenants
2. ✅ Approve additional super admins via `/api/admin/approve-user`
3. ✅ Set up webhook to keep Clerk and database in sync
4. ✅ Create your tenant structure

**You're all set!** 🚀
