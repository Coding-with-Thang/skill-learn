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
| flashcards | flashcards.create, flashcards.read, flashcards.update, flashcards.delete, flashcards.manage_tenant, flashcards.manage_global |

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

The system includes 7 predefined template sets for easy tenant onboarding:

### Generic (Default)
Best for general-purpose organizations.
1. **Administrator** - Full system access and user management
2. **Manager** - Can manage content, users, and view reports
3. **Team Lead** - Lead teams, assign content, manage points
4. **Member** - Standard user with basic access
5. **Guest** - Limited read-only access for external users

### Education
Best for schools, universities, and educational institutions.
1. **School Admin** - Full administrative access
2. **Teacher** - Create courses, quizzes, and grade students
3. **Teaching Assistant** - Help with courses and assist students
4. **Student** - Access courses, take quizzes, earn rewards
5. **Parent** - View student progress and reports

### Business
Best for corporate training and development.
1. **Owner** - Full control including billing
2. **HR Manager** - Manage employees and training programs
3. **Department Head** - Manage team training and performance
4. **Employee** - Standard employee with training access
5. **Contractor** - Limited access for external workers

### Support
Best for customer support and service teams.
1. **Support Director** - Full access to support operations
2. **Support Manager** - Oversee support team
3. **Senior Agent** - Handle escalations and train new agents
4. **Support Agent** - Handle standard customer support
5. **Customer** - Self-service access

### SaaS
Best for SaaS product teams.
1. **Owner** - Full control including billing
2. **Admin** - Manage users, settings, and configuration
3. **Power User** - Advanced features and content creation
4. **User** - Standard platform access
5. **Read-Only** - View-only access for stakeholders

### Healthcare
Best for healthcare training and compliance.
1. **Administrator** - Full administrative access
2. **Training Director** - Manage training programs and compliance
3. **Supervisor** - Supervise staff training and certifications
4. **Staff** - Complete required training and certifications
5. **Volunteer** - Basic training access

### Retail
Best for retail training and operations.
1. **Regional Manager** - Full access to regional operations
2. **Store Manager** - Manage store training and performance
3. **Shift Lead** - Lead shifts and onboard new staff
4. **Sales Associate** - Complete training and serve customers
5. **New Hire** - Onboarding access for new employees

## Permission Patterns

Role templates use permission patterns for flexible configuration:

| Pattern | Description | Example |
|---------|-------------|---------|
| `*.*` | All permissions | Grants full access |
| `category.*` | All permissions in category | `users.*` grants all user permissions |
| `category.action` | Specific permission | `users.read` grants only read access |

## Tenant Onboarding

When creating a new tenant, initialize roles from a template set:

```javascript
// PUT /api/tenants/[tenantId]/roles
// Body: { templateSetName: "generic" }
```

Available template sets:
- `generic` (default) - General-purpose organizations
- `education` - Schools and educational institutions
- `business` - Corporate training and development
- `support` - Customer support teams
- `saas` - SaaS product teams
- `healthcare` - Healthcare training and compliance
- `retail` - Retail training and operations

This creates up to 5 roles with pre-configured permissions based on the selected template.

## Best Practices

1. **Use Permission Constants**: Import `PERMISSIONS` from the library to avoid typos
2. **Check in Backend**: Always verify permissions server-side, frontend checks are for UX
3. **Tenant Isolation**: Always include `tenantId` when checking permissions
4. **Deprecate vs Delete**: Prefer deprecating permissions over deleting to maintain audit trail
5. **Minimal Permissions**: Grant only the permissions needed for each role
6. **Regular Review**: Periodically review and audit role permissions
