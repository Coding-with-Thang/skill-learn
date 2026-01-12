# Clerk Webhook Integration for Multi-Tenant Architecture

This document describes how the Clerk webhook integrates with the multi-tenant permission system.

## Overview

The webhook handler (`/apps/lms/app/api/webhooks/route.js`) processes Clerk events and:
1. Creates/updates users in the database
2. Assigns users to tenants
3. Assigns default roles
4. Syncs tenant and permission metadata back to Clerk

## Supported Events

### user.created
When a new user signs up:
- Creates user record in database
- Checks for tenant assignment in Clerk metadata
- Assigns default role if specified
- Syncs tenant info to Clerk publicMetadata

### user.updated
When user data changes:
- Updates user record in database
- Handles tenant changes (removes old role assignments)
- Syncs updated tenant info to Clerk

### user.deleted
When a user is deleted:
- Removes all role assignments
- Deletes user from database

### organizationMembership.created (Clerk Organizations)
When a user joins an organization:
- Finds matching tenant by org slug
- Assigns user to tenant
- Assigns default "Member" role
- Syncs metadata to Clerk

### organizationMembership.deleted
When a user leaves an organization:
- Removes role assignments for that tenant
- Clears tenant from user
- Clears Clerk metadata

### session.created
On new session:
- Refreshes user's permission metadata in Clerk

## Clerk Metadata Structure

After processing, users have this public metadata structure:

```json
{
  "tenantId": "abc123",
  "tenantName": "Acme Corp",
  "tenantSlug": "acme-corp",
  "roles": ["Manager", "Team Lead"],
  "permissions": ["users.read", "quizzes.create", "..."],
  "canAccessAdminDashboard": true,
  "canManageUsers": true,
  "canManageContent": true,
  "canViewReports": true,
  "canManageRoles": false
}
```

## Tenant Assignment Methods

### 1. Via Clerk Metadata (Invitation/Admin)
Set in Clerk Dashboard or via API:
```javascript
// When creating/inviting a user
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    tenantId: "tenant_id_here",
    // OR
    tenantSlug: "tenant-slug",
    defaultRole: "Member" // Optional
  }
});
```

### 2. Via Clerk Organizations
If using Clerk Organizations:
1. Create Clerk organization with slug matching tenant slug
2. When user joins org, webhook assigns them to matching tenant

### 3. Via Admin Interface
Super admin can:
1. Assign user to tenant from CMS
2. Assign roles to user in tenant

## Clerk Sync Utilities

The `@skill-learn/lib/utils/clerkSync.js` module provides:

```javascript
import { 
  syncUserMetadataToClerk,
  syncTenantUsersMetadata,
  assignUserToTenant,
  removeUserFromTenant
} from "@skill-learn/lib/utils/clerkSync.js";

// Sync single user's metadata
await syncUserMetadataToClerk(userId, tenantId);

// Sync all users in tenant (after role permission changes)
await syncTenantUsersMetadata(tenantId, roleId);

// Assign user to tenant with optional default role
await assignUserToTenant(userId, tenantId, "Member");

// Remove user from tenant
await removeUserFromTenant(userId, tenantId);
```

## Auto-Sync Triggers

Metadata is automatically synced when:
1. User role is assigned (user-roles API)
2. User role is removed (user-roles API)
3. Role permissions change (role permissions API)
4. User is created/updated (webhook)

## Using Permissions in Frontend

### From Clerk Session
```javascript
import { useUser } from "@clerk/nextjs";

function MyComponent() {
  const { user } = useUser();
  const metadata = user?.publicMetadata;
  
  const canAccessAdmin = metadata?.canAccessAdminDashboard;
  const permissions = metadata?.permissions || [];
  
  if (permissions.includes("users.create")) {
    // Show create user button
  }
}
```

### From usePermissions Hook
```javascript
import { usePermissions } from "@skill-learn/lib";

function MyComponent() {
  const { hasPermission, canCreate, loading } = usePermissions();
  
  if (hasPermission("users.create")) {
    // Show create user button
  }
  
  if (canCreate("quizzes")) {
    // Show create quiz button
  }
}
```

## Environment Variables

Required in `.env`:
```env
# Clerk Webhook Secret (from Clerk Dashboard > Webhooks)
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Alternative name (also supported)
WEBHOOK_SECRET=whsec_xxxxx
```

## Webhook Setup in Clerk Dashboard

1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks`
3. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `organizationMembership.created` (if using Orgs)
   - `organizationMembership.deleted` (if using Orgs)
   - `session.created` (optional, for metadata refresh)
4. Copy the signing secret to your environment variables

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using Svix signatures
2. **No Self-Promotion**: Users cannot assign themselves super_admin role via webhook
3. **Tenant Isolation**: Role assignments are always tenant-scoped
4. **Metadata Sync**: Only public metadata is used (no sensitive data)

## Debugging

Enable verbose logging by checking console output for `[Webhook]` and `[ClerkSync]` prefixes:

```
[Webhook] Processing event: user.created for user: user_abc123
[Webhook] Created user: user_abc123, tenant: tenant_xyz, superAdmin: false
[ClerkSync] Synced metadata for user user_abc123: 2 roles, 15 permissions
```
