# Role-Based to Permission-Based Access Control Migration

**Date:** January 2025  
**Status:** ✅ **COMPLETED**

## Overview

This document describes the migration from role-based access control (RBAC) to permission-based access control (PBAC) throughout the codebase. The system now uses fine-grained permissions instead of hardcoded role checks for authorization.

## Changes Made

### 1. Backend Auth Utilities (`packages/lib/utils/utils/auth.js`)

#### Updated `requireAdmin()`
- **Before:** Checked for `OPERATIONS` or `MANAGER` role
- **After:** Checks for admin-level permissions:
  - `users.create`, `users.update`, `users.delete`
  - `dashboard.admin`, `dashboard.manager`
  - `roles.assign`, `roles.create`
  - `settings.update`
- **Legacy Fallback:** Still supports `OPERATIONS` or `MANAGER` roles for backward compatibility during migration

#### Updated `requireAdminForAction()`
- Same permission-based approach as `requireAdmin()`
- Throws errors instead of returning NextResponse (for server actions)

### 2. API Routes

#### User Management Routes (`apps/lms/app/api/users/route.js`)
- **GET /api/users**: Now requires `users.read` permission
- **POST /api/users**: 
  - Requires `users.create` permission
  - Role assignment now checks `roles.assign` permission instead of role
  - Legacy fallback for role-based restrictions

#### User Detail Routes (`apps/lms/app/api/users/[userId]/route.js`)
- **GET /api/users/[userId]**: Now requires `users.read` permission
- **PUT /api/users/[userId]**: 
  - Requires `users.update` permission
  - Role changes now require `roles.assign` permission
  - Legacy fallback for role-based restrictions
- **DELETE /api/users/[userId]**: Now requires `users.delete` permission

#### Tenant Features Route (`apps/lms/app/api/tenant/features/route.js`)
- Updated `requireTenantAdmin()` helper to prioritize permissions
- Checks for `features.manage`, `admin.full`, or admin category permissions
- Legacy fallback for `OPERATIONS` or `MANAGER` roles

### 3. Frontend Components

#### Layout Components
- **Header** (`apps/lms/components/layout/Header.jsx`): 
  - Replaced `useUserRole()` with `usePermissions()`
  - Checks for admin permissions instead of role
  
- **DashboardLayout** (`apps/lms/components/layout/DashboardLayout.jsx`):
  - Uses `usePermissions()` hook
  - Permission-based admin route detection
  
- **MobileSidebar** (`apps/lms/components/layout/MobileSidebar.jsx`):
  - Uses `usePermissions()` hook
  - Permission-based admin check

#### User Management Components
- **UserForm** (`apps/lms/components/user/UserForm.jsx`):
  - Uses `hasPermission('roles.assign')` instead of role check
  - Removed role-based restrictions from UI

- **Users Page** (`apps/lms/app/(lms)/(admin)/dashboard/users/page.jsx`):
  - Delete button visibility now uses `hasPermission('users.delete')` instead of role check

## Permission Mappings

### Admin Permissions
These permissions grant admin-level access (replacing `OPERATIONS` and `MANAGER` roles):

| Permission | Description | Replaces |
|------------|-------------|----------|
| `users.create` | Create new users | MANAGER, OPERATIONS |
| `users.read` | View users | MANAGER, OPERATIONS |
| `users.update` | Update users | MANAGER, OPERATIONS |
| `users.delete` | Delete users | OPERATIONS |
| `roles.assign` | Assign roles to users | OPERATIONS |
| `roles.create` | Create roles | OPERATIONS |
| `dashboard.admin` | Access admin dashboard | OPERATIONS, MANAGER |
| `dashboard.manager` | Access manager dashboard | MANAGER |
| `settings.update` | Update settings | OPERATIONS, MANAGER |

### Feature-Specific Permissions
- `features.manage` - Manage tenant features (replaces admin role check)
- `admin.full` - Full admin access (if configured)
- Admin category permissions - Any permission in the "admin" category

## Legacy Compatibility

The migration maintains backward compatibility:

1. **Legacy Role Fallback**: If permission system is not set up or user has no permissions, the system falls back to checking `OPERATIONS` or `MANAGER` roles
2. **Gradual Migration**: Organizations can migrate users from roles to permissions gradually
3. **Role Field Retention**: The `role` field in the User model is retained for:
   - Business logic (manager assignment hierarchy)
   - Legacy compatibility
   - Data display

## Remaining Role-Based Logic

The following use cases still reference roles, but these are for **business logic**, not **authorization**:

1. **Manager Assignment Hierarchy** (`apps/lms/app/api/users/route.js`, `apps/lms/app/api/users/[userId]/route.js`):
   - Validates which users can be assigned as managers based on their role
   - This enforces organizational hierarchy rules, not access control
   - Example: MANAGER role users can only be assigned OPERATIONS role users as managers

2. **UserForm Manager Filtering** (`apps/lms/components/user/UserForm.jsx`):
   - Filters available managers based on role for business logic
   - This is data filtering, not authorization

3. **Role Display** (`apps/lms/app/(lms)/(admin)/dashboard/users/page.jsx`):
   - Displays user roles in the UI
   - This is informational only

## Migration Guide for Organizations

1. **Seed Permissions**: Ensure permissions are seeded in the database
   ```bash
   npm run seed:permissions
   ```

2. **Create Role Templates**: Create or update role templates with appropriate permissions

3. **Assign Permissions to Roles**: Configure tenant roles with permissions that match their intended access level

4. **Migrate Users**: Assign users to tenant roles with permissions instead of relying on legacy role field

5. **Remove Legacy Checks**: Once all users are migrated to permission-based roles, legacy fallbacks can be removed

## Testing Checklist

- [x] Admin routes require appropriate permissions
- [x] User creation requires `users.create` permission
- [x] User updates require `users.update` permission
- [x] User deletion requires `users.delete` permission
- [x] Role assignment requires `roles.assign` permission
- [x] Frontend components check permissions instead of roles
- [x] Legacy role fallback works for backward compatibility
- [x] Manager assignment business logic still works

## Future Improvements

1. **Remove Legacy Fallbacks**: Once all users are migrated, remove role-based fallbacks
2. **Permission-Based Manager Assignment**: Consider migrating manager assignment logic to use permissions
3. **Audit Role Field Usage**: Eventually deprecate the legacy `role` field once fully migrated
4. **Permission Documentation**: Document all available permissions and their use cases

## Related Documentation

- [Permissions System](./PERMISSIONS_SYSTEM.md) - Full permissions system documentation
- [Super Admin Security](./SUPER_ADMIN_SECURITY.md) - CMS super admin access control
