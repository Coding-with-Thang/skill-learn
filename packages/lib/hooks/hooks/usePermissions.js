"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * React hook for managing user permissions in the frontend
 * Fetches permissions from the API and provides helper functions
 */
export function usePermissions(tenantId = null) {
  const [permissions, setPermissions] = useState([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [tenantPermissions, setTenantPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch permissions from API
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = tenantId
        ? `/api/user-permissions?tenantId=${tenantId}`
        : "/api/user-permissions";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }

      const data = await response.json();

      setPermissions(data.allPermissions || []);
      setPermissionsByCategory(data.permissionsByCategory || {});
      setTenantPermissions(data.tenantPermissions || []);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Fetch on mount and when tenantId changes
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Permission checking helpers
  const permissionSet = useMemo(
    () => new Set(permissions),
    [permissions]
  );

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission name to check
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (permission) => {
      return permissionSet.has(permission);
    },
    [permissionSet]
  );

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissionList - List of permission names
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback(
    (permissionList) => {
      return permissionList.some((p) => permissionSet.has(p));
    },
    [permissionSet]
  );

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissionList - List of permission names
   * @returns {boolean}
   */
  const hasAllPermissions = useCallback(
    (permissionList) => {
      return permissionList.every((p) => permissionSet.has(p));
    },
    [permissionSet]
  );

  /**
   * Check if user can perform a CRUD operation on a resource
   * @param {string} resource - Resource name (e.g., 'users', 'quizzes')
   * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
   * @returns {boolean}
   */
  const can = useCallback(
    (resource, action) => {
      const permission = `${resource}.${action}`;
      return permissionSet.has(permission);
    },
    [permissionSet]
  );

  /**
   * Get all permissions for a specific category
   * @param {string} category - Category name
   * @returns {string[]}
   */
  const getPermissionsForCategory = useCallback(
    (category) => {
      return permissionsByCategory[category] || [];
    },
    [permissionsByCategory]
  );

  /**
   * Check if user has any permissions in a category
   * @param {string} category - Category name
   * @returns {boolean}
   */
  const hasAccessToCategory = useCallback(
    (category) => {
      const categoryPermissions = permissionsByCategory[category] || [];
      return categoryPermissions.length > 0;
    },
    [permissionsByCategory]
  );

  return {
    // State
    permissions,
    permissionsByCategory,
    tenantPermissions,
    loading,
    error,

    // Actions
    refetch: fetchPermissions,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    getPermissionsForCategory,
    hasAccessToCategory,

    // Convenience checks for common operations
    canCreate: (resource) => can(resource, "create"),
    canRead: (resource) => can(resource, "read"),
    canUpdate: (resource) => can(resource, "update"),
    canDelete: (resource) => can(resource, "delete"),
    canPublish: (resource) => can(resource, "publish"),
    canAssign: (resource) => can(resource, "assign"),
  };
}

/**
 * Common permission constants for use in components
 */
export const PERMISSIONS = {
  // User Management
  USERS_CREATE: "users.create",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_IMPORT: "users.import",
  USERS_EXPORT: "users.export",

  // Quiz Management
  QUIZZES_CREATE: "quizzes.create",
  QUIZZES_READ: "quizzes.read",
  QUIZZES_UPDATE: "quizzes.update",
  QUIZZES_DELETE: "quizzes.delete",
  QUIZZES_PUBLISH: "quizzes.publish",
  QUIZZES_ASSIGN: "quizzes.assign",

  // Course Management
  COURSES_CREATE: "courses.create",
  COURSES_READ: "courses.read",
  COURSES_UPDATE: "courses.update",
  COURSES_DELETE: "courses.delete",
  COURSES_PUBLISH: "courses.publish",

  // Category Management
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_READ: "categories.read",
  CATEGORIES_UPDATE: "categories.update",
  CATEGORIES_DELETE: "categories.delete",

  // Rewards Management
  REWARDS_CREATE: "rewards.create",
  REWARDS_READ: "rewards.read",
  REWARDS_UPDATE: "rewards.update",
  REWARDS_DELETE: "rewards.delete",
  REWARDS_APPROVE: "rewards.approve",
  REWARDS_FULFILL: "rewards.fulfill",

  // Points Management
  POINTS_VIEW: "points.view",
  POINTS_GRANT: "points.grant",
  POINTS_DEDUCT: "points.deduct",
  POINTS_HISTORY: "points.history",

  // Games Management
  GAMES_CREATE: "games.create",
  GAMES_READ: "games.read",
  GAMES_UPDATE: "games.update",
  GAMES_DELETE: "games.delete",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
  REPORTS_CREATE: "reports.create",
  REPORTS_SCHEDULE: "reports.schedule",

  // Leaderboard
  LEADERBOARD_VIEW: "leaderboard.view",
  LEADERBOARD_MANAGE: "leaderboard.manage",

  // Audit
  AUDIT_VIEW: "audit.view",
  AUDIT_EXPORT: "audit.export",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update",

  // Roles
  ROLES_CREATE: "roles.create",
  ROLES_READ: "roles.read",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  ROLES_ASSIGN: "roles.assign",

  // Billing
  BILLING_VIEW: "billing.view",
  BILLING_MANAGE: "billing.manage",

  // Dashboard
  DASHBOARD_ADMIN: "dashboard.admin",
  DASHBOARD_MANAGER: "dashboard.manager",
};

export default usePermissions;
