# Multi-Tenant Permissions System

This document describes the permissions system implementation for the multi-tenant architecture.

## Overview

The permissions system provides fine-grained access control across tenants with the following features:

- **Global Permissions Catalog**: Super admin manages all available permissions
- **Role Templates**: Pre-defined role configurations for tenant onboarding
- **Tenant Roles**: Custom roles per tenant with customizable permissions
- **User Role Assignments**: Assign multiple roles to users within tenants

## Database Models

### Permission
Global permission definitions managed by super admin.

```prisma
model Permission {
  id          String   @id
  name        String   @unique  // e.g., "users.create"
  displayName String             // e.g., "Create Users"
  description String?
  category    String             // e.g., "user_management"
  isActive    Boolean  @default(true)
  isDeprecated Boolean @default(false)
}
```

### RoleTemplate
Pre-configured role templates for tenant onboarding.

```prisma
model RoleTemplate {
  id              String  @id
  templateSetName String  // e.g., "generic", "education"
  roleName        String  // e.g., "Administrator"
  description     String?
  slotPosition    Int     // 1-5
  isDefaultSet    Boolean
}
```

### TenantRole
Custom roles created within a tenant.

```prisma
model TenantRole {
  id          String   @id
  tenantId    String   @db.ObjectId
  roleAlias   String   // Custom name like "Teacher"
  description String?
  slotPosition Int
  isActive    Boolean
}
```

### UserRole
Assigns roles to users within tenants.

```prisma
model UserRole {
  id           String @id
  userId       String // Clerk user ID
  tenantId     String @db.ObjectId
  tenantRoleId String @db.ObjectId
  assignedAt   DateTime
  assignedBy   String? // Admin who assigned
}
```

## API Endpoints

### Super Admin APIs (CMS)

#### Permissions
- `GET /api/permissions` - List all permissions
- `POST /api/permissions` - Create permission
- `GET /api/permissions/[id]` - Get permission details
- `PUT /api/permissions/[id]` - Update permission
- `DELETE /api/permissions/[id]` - Delete permission

#### Role Templates
- `GET /api/role-templates` - List role templates
- `POST /api/role-templates` - Create role template
- `GET /api/role-templates/[id]` - Get template details
- `PUT /api/role-templates/[id]` - Update template
- `DELETE /api/role-templates/[id]` - Delete template
- `GET /api/role-templates/[id]/permissions` - Get template permissions
- `POST /api/role-templates/[id]/permissions` - Add permissions
- `DELETE /api/role-templates/[id]/permissions` - Remove permissions

#### Tenant Roles
- `GET /api/tenants/[tenantId]/roles` - List tenant roles
- `POST /api/tenants/[tenantId]/roles` - Create role
- `PUT /api/tenants/[tenantId]/roles` - Initialize from template set
- `GET /api/tenants/[tenantId]/roles/[roleId]` - Get role details
- `PUT /api/tenants/[tenantId]/roles/[roleId]` - Update role
- `DELETE /api/tenants/[tenantId]/roles/[roleId]` - Delete role
- `GET/POST/DELETE /api/tenants/[tenantId]/roles/[roleId]/permissions` - Manage permissions

#### User Roles
- `GET /api/tenants/[tenantId]/user-roles` - List user role assignments
- `POST /api/tenants/[tenantId]/user-roles` - Assign role to user
- `DELETE /api/tenants/[tenantId]/user-roles` - Remove role from user

### User APIs
- `GET /api/user-permissions` - Get current user's permissions
- `POST /api/user-permissions/check` - Check specific permissions

## Permission Categories

| Category | Permissions |
|----------|------------|
| user_management | users.create, users.read, users.update, users.delete, users.import, users.export |
| quiz_management | quizzes.create, quizzes.read, quizzes.update, quizzes.delete, quizzes.publish, quizzes.assign |
| course_management | courses.create, courses.read, courses.update, courses.delete, courses.publish |
| category_management | categories.create, categories.read, categories.update, categories.delete |
| rewards_management | rewards.create, rewards.read, rewards.update, rewards.delete, rewards.approve, rewards.fulfill |
| points_management | points.view, points.grant, points.deduct, points.history |
| games_management | games.create, games.read, games.update, games.delete |
| reports | reports.view, reports.export, reports.create, reports.schedule |
| leaderboard | leaderboard.view, leaderboard.manage |
| audit | audit.view, audit.export |
| settings | settings.view, settings.update |
| roles | roles.create, roles.read, roles.update, roles.delete, roles.assign |
| billing | billing.view, billing.manage |
| dashboard | dashboard.admin, dashboard.manager |

## Usage in Backend (API Routes)

### Using Permission Utilities

```javascript
import { requirePermission, requireAnyPermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";

// Require single permission
export async function POST(request) {
  const result = await requirePermission(PERMISSIONS.USERS_CREATE, tenantId);
  if (result instanceof NextResponse) return result;
  
  const { userId, permissions } = result;
  // ... handle request
}

// Require any of multiple permissions
export async function GET(request) {
  const result = await requireAnyPermission([
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE
  ], tenantId);
  if (result instanceof NextResponse) return result;
  
  // ... handle request
}
```

### Available Functions

```javascript
// Check functions
hasPermission(userId, "users.create", tenantId)
hasAnyPermission(userId, ["users.read", "users.update"], tenantId)
hasAllPermissions(userId, ["users.read", "users.delete"], tenantId)

// Require functions (return NextResponse on failure)
requirePermission("users.create", tenantId)
requireAnyPermission(["users.read", "users.update"], tenantId)
requireAllPermissions(["users.read", "users.delete"], tenantId)

// Tenant membership
isUserInTenant(userId, tenantId)
requireTenantMembership(tenantId)

// Get user info
getUserPermissions(userId, tenantId)
getUserTenants(userId)
```

## Usage in Frontend (React)

### usePermissions Hook

```jsx
import { usePermissions, PERMISSIONS } from "@skill-learn/lib";

function MyComponent() {
  const { 
    hasPermission, 
    can, 
    loading,
    canCreate,
    canUpdate,
    canDelete 
  } = usePermissions(tenantId);

  if (loading) return <Loading />;

  return (
    <div>
      {hasPermission(PERMISSIONS.USERS_CREATE) && <CreateUserButton />}
      {can("quizzes", "publish") && <PublishButton />}
      {canDelete("courses") && <DeleteButton />}
    </div>
  );
}
```

### PermissionGate Component

```jsx
import { PermissionGate, CanAccess, RequirePermission } from "@skill-learn/ui/components/permission-gate";

// Simple gate
<PermissionGate permission="users.create">
  <CreateUserButton />
</PermissionGate>

// With fallback
<PermissionGate 
  permission="reports.export" 
  fallback={<p>You cannot export</p>}
>
  <ExportButton />
</PermissionGate>

// Multiple permissions (any)
<PermissionGate permission={["users.create", "users.update"]}>
  <UserForm />
</PermissionGate>

// Multiple permissions (all required)
<PermissionGate 
  permission={["users.create", "users.update"]} 
  requireAll
>
  <AdvancedUserForm />
</PermissionGate>

// Render prop pattern
<CanAccess permission="users.delete">
  {({ hasAccess }) => (
    <button disabled={!hasAccess}>Delete</button>
  )}
</CanAccess>

// Full page protection
<RequirePermission 
  permission="dashboard.admin"
  unauthorizedComponent={<AccessDenied />}
>
  <AdminDashboard />
</RequirePermission>
```

## Seeding Permissions

Run the permissions seed to populate the database:

```bash
# Seed permissions and role templates
npm run seed:permissions

# Or run all seeds
npm run seed:all
```

## Role Template Sets

### Generic (Default)
1. **Administrator** - Full access to all features
2. **Manager** - Manage users and content, view reports
3. **Content Creator** - Create and manage quizzes/courses
4. **Team Lead** - Lead team, assign quizzes, manage points
5. **Learner** - Basic learner access

### Education
1. **School Admin** - Full institution access
2. **Teacher** - Create content, grade students
3. **Teaching Assistant** - Assist teachers
4. **Student** - Take courses and quizzes
5. **Parent** - View student progress

## Tenant Onboarding

When creating a new tenant, initialize roles from a template set:

```javascript
// POST /api/tenants/[tenantId]/roles
// Body: { templateSetName: "generic" } // or "education"
```

This creates all 5 default roles with pre-configured permissions.

## Best Practices

1. **Use Permission Constants**: Import `PERMISSIONS` from the library to avoid typos
2. **Check in Backend**: Always verify permissions server-side, frontend checks are for UX
3. **Tenant Isolation**: Always include `tenantId` when checking permissions
4. **Deprecate vs Delete**: Prefer deprecating permissions over deleting to maintain audit trail
5. **Minimal Permissions**: Grant only the permissions needed for each role
6. **Regular Review**: Periodically review and audit role permissions
