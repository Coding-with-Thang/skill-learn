"use client";

import { usePermissions } from "@skill-learn/lib/hooks/usePermissions";

/**
 * PermissionGate - Conditionally render children based on user permissions
 *
 * @param {Object} props
 * @param {string|string[]} props.permission - Required permission(s)
 * @param {boolean} props.requireAll - If true, all permissions are required (default: false)
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {React.ReactNode} props.fallback - Content to render if not authorized (optional)
 * @param {string} props.tenantId - Tenant ID to check permissions against (optional)
 * @param {boolean} props.showLoading - Show loading state (default: true)
 * @param {React.ReactNode} props.loadingComponent - Custom loading component (optional)
 *
 * @example
 * // Single permission
 * <PermissionGate permission="users.create">
 *   <CreateUserButton />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (any)
 * <PermissionGate permission={["users.create", "users.update"]}>
 *   <UserForm />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate permission={["users.create", "users.update"]} requireAll>
 *   <AdvancedUserForm />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate permission="reports.export" fallback={<p>You cannot export reports</p>}>
 *   <ExportButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
  tenantId = null,
  showLoading = true,
  loadingComponent = null,
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions(tenantId);

  // Show loading state
  if (loading && showLoading) {
    if (loadingComponent) {
      return loadingComponent;
    }
    return null; // Don't show anything while loading by default
  }

  // Normalize permission to array
  const permissions = Array.isArray(permission) ? permission : [permission];

  // Check permissions
  let hasAccess = false;
  if (permissions.length === 1) {
    hasAccess = hasPermission(permissions[0]);
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissions);
  } else {
    hasAccess = hasAnyPermission(permissions);
  }

  // Render based on access
  if (hasAccess) {
    return children;
  }

  return fallback;
}

/**
 * CanAccess - Render prop version for more flexibility
 *
 * @example
 * <CanAccess permission="users.delete">
 *   {({ hasAccess }) => (
 *     <button disabled={!hasAccess} onClick={handleDelete}>
 *       Delete User
 *     </button>
 *   )}
 * </CanAccess>
 */
export function CanAccess({
  permission,
  requireAll = false,
  children,
  tenantId = null,
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions(tenantId);

  // Normalize permission to array
  const permissions = Array.isArray(permission) ? permission : [permission];

  // Check permissions
  let hasAccess = false;
  if (!loading) {
    if (permissions.length === 1) {
      hasAccess = hasPermission(permissions[0]);
    } else if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }

  // Render prop pattern
  if (typeof children === "function") {
    return children({ hasAccess, loading });
  }

  return hasAccess ? children : null;
}

/**
 * RequirePermission - Wrapper that redirects or shows error if permission denied
 *
 * @example
 * <RequirePermission permission="dashboard.admin" redirectTo="/unauthorized">
 *   <AdminDashboard />
 * </RequirePermission>
 */
export function RequirePermission({
  permission,
  requireAll = false,
  children,
  tenantId = null,
  unauthorizedComponent = null,
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions(tenantId);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Normalize permission to array
  const permissions = Array.isArray(permission) ? permission : [permission];

  // Check permissions
  let hasAccess = false;
  if (permissions.length === 1) {
    hasAccess = hasPermission(permissions[0]);
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissions);
  } else {
    hasAccess = hasAnyPermission(permissions);
  }

  // Render
  if (hasAccess) {
    return children;
  }

  // Show unauthorized component or default message
  if (unauthorizedComponent) {
    return unauthorizedComponent;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="text-6xl">🔒</div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Access Denied
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
        You don't have permission to access this feature. Please contact your
        administrator if you believe this is an error.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Required: {permissions.join(", ")}
      </p>
    </div>
  );
}

export default PermissionGate;
