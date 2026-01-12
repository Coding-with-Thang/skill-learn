# Tenant Admin Features

This document describes the tenant admin features available in the LMS dashboard for managing billing, roles, and user permissions.

## Overview

Tenant admins have access to organization-level management features including:

1. **Billing & Subscription Management** - View subscription status, usage, and billing history
2. **Role Management** - Create, edit, and delete roles for the organization
3. **User Role Assignments** - Assign and remove roles for users in the organization

## Accessing Tenant Admin Features

Navigate to the LMS Admin Dashboard (`/dashboard`) and use the sidebar to access:

- **Billing** (`/dashboard/billing`) - View billing and subscription info
- **Roles > Manage Roles** (`/dashboard/roles`) - Manage organization roles
- **Roles > User Assignments** (`/dashboard/user-roles`) - Manage user role assignments

## Features

### 1. Billing & Subscription

**URL:** `/dashboard/billing`

**Required Permission:** `billing.view`

**Features:**
- View current subscription plan and status
- See billing period and days remaining
- Monitor usage (users, role slots)
- View plan features
- See payment history (role slot purchases)
- Access to upgrade/manage subscription

**API Endpoints:**
- `GET /api/tenant/billing` - Get billing information

### 2. Role Management

**URL:** `/dashboard/roles`

**Required Permissions:**
- `roles.read` - View roles
- `roles.create` - Create new roles
- `roles.update` - Edit existing roles
- `roles.delete` - Delete roles

**Features:**
- View all organization roles with permission counts
- Create new roles (custom or from templates)
- Edit role name, description, and status
- Manage role permissions via checkbox UI
- Delete roles (if no users assigned)
- Initialize roles from template sets (education, business, support, etc.)
- View role slot usage

**API Endpoints:**
- `GET /api/tenant/roles` - List all roles
- `POST /api/tenant/roles` - Create a new role
- `PUT /api/tenant/roles` - Initialize roles from template
- `GET /api/tenant/roles/[roleId]` - Get single role
- `PUT /api/tenant/roles/[roleId]` - Update role
- `DELETE /api/tenant/roles/[roleId]` - Delete role

### 3. User Role Assignments

**URL:** `/dashboard/user-roles`

**Required Permissions:**
- `roles.read` or `roles.assign` - View assignments
- `roles.assign` - Assign or remove roles

**Features:**
- View all user-role assignments
- Search by user or role name
- Assign roles to users
- Remove role assignments
- Statistics showing total assignments, users with roles

**API Endpoints:**
- `GET /api/tenant/user-roles` - List all assignments
- `POST /api/tenant/user-roles` - Assign role to user
- `DELETE /api/tenant/user-roles` - Remove role assignment

### 4. Supporting APIs

**Get Tenant Info:**
- `GET /api/tenant` - Get current user's tenant information

**Get Available Permissions:**
- `GET /api/tenant/permissions` - Get all available permissions grouped by category
- Required: `roles.read` permission

**Get Role Templates:**
- `GET /api/tenant/templates` - Get available role template sets
- Required: `roles.create` permission

## Dashboard Integration

The main dashboard (`/dashboard`) includes a **Tenant Summary** component that shows:

- Organization name and slug
- Current subscription tier and status
- Days until next billing
- Usage meters for users and role slots
- Quick links to Billing and Roles management

## Permission Requirements

| Feature | Required Permission(s) |
|---------|----------------------|
| View Billing | `billing.view` |
| Manage Billing | `billing.manage` |
| View Roles | `roles.read` |
| Create Roles | `roles.create` |
| Edit Roles | `roles.update` |
| Delete Roles | `roles.delete` |
| Assign Roles to Users | `roles.assign` |

## Role Template Sets

When initializing roles from templates, the following sets are available:

| Set Name | Use Case | Roles |
|----------|----------|-------|
| `generic` | General purpose | Admin, Manager, Team Lead, User, Viewer |
| `education` | Educational institutions | Administrator, Instructor, Teaching Assistant, Student, Auditor |
| `business` | Corporate training | Director, Department Manager, Team Lead, Employee, Trainee |
| `support` | Customer support | Support Director, Support Manager, Senior Agent, Support Agent, Observer |
| `saas` | SaaS products | Product Owner, Product Manager, Developer, QA Tester, Stakeholder |
| `healthcare` | Healthcare training | Clinical Director, Department Head, Senior Clinician, Staff, Trainee |
| `retail` | Retail operations | Store Manager, Assistant Manager, Shift Lead, Sales Associate, Trainee |

## Clerk Metadata Sync

When roles or permissions are modified:

1. Changes are saved to the database
2. User metadata is synchronized to Clerk's `publicMetadata`
3. Frontend can access permissions via Clerk's `useUser()` hook

The sync includes:
- `tenantId` - Current tenant ID
- `tenantName` - Organization name
- `tenantSlug` - Organization slug
- `roles` - Array of role names
- `permissions` - Array of permission strings
- Helper flags: `isAdmin`, `isManager`, `canManageContent`, `canViewReports`

## UI Components

### TenantSummary
A dashboard widget showing organization overview with:
- Organization name and status
- Subscription tier badge
- Usage progress bars
- Quick action buttons

### Role Cards
Display role information with:
- Role name and description
- Permission count
- User count
- Action buttons (permissions, edit, delete)

### Permission Dialog
A grouped checkbox UI for managing role permissions:
- Permissions organized by category
- Expandable/collapsible sections
- Real-time updates when toggling

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

Common HTTP status codes:
- `401` - Not authenticated
- `403` - Permission denied
- `400` - Bad request (validation error)
- `404` - Resource not found
- `500` - Server error

## Security Considerations

1. **Permission Checks** - All endpoints verify user has required permissions
2. **Tenant Isolation** - Users can only manage roles/users in their own tenant
3. **Clerk Sync** - Metadata updates are non-blocking (failures logged, not thrown)
4. **Role Deletion Protection** - Cannot delete roles with assigned users
