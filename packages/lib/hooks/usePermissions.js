"use client";

import { useEffect } from "react";
import { usePermissionsStore } from "../stores/store/permissionsStore.js";

/**
 * React hook for managing user permissions in the frontend
 * 
 * @deprecated Use usePermissionsStore directly for better performance
 * This hook now wraps the Zustand store for backward compatibility
 * 
 * @param {string|null} tenantId - Optional tenant ID to fetch permissions for
 * @returns {Object} Permissions state and helper functions
 * 
 * @example
 * // Old way (still works):
 * const { permissions, hasPermission, loading } = usePermissions(tenantId);
 * 
 * // Recommended: Use store directly
 * import { usePermissionsStore } from '@skill-learn/lib/stores/permissionsStore';
 * const { permissions, hasPermission, isLoading, fetchPermissions } = usePermissionsStore();
 * useEffect(() => { fetchPermissions(tenantId); }, [tenantId, fetchPermissions]);
 */
export function usePermissions(tenantId = null) {
  const store = usePermissionsStore();
  const {
    permissions,
    permissionsByCategory,
    tenantPermissions,
    isLoading: loading,
    error,
    fetchPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    getPermissionsForCategory,
    hasAccessToCategory,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canPublish,
    canAssign,
  } = store;

  // Fetch on mount and when tenantId changes
  useEffect(() => {
    fetchPermissions(tenantId);
  }, [tenantId, fetchPermissions]);

  return {
    // State
    permissions,
    permissionsByCategory,
    tenantPermissions,
    loading,
    error,

    // Actions
    refetch: () => fetchPermissions(tenantId),

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    getPermissionsForCategory,
    hasAccessToCategory,

    // Convenience checks for common operations
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canPublish,
    canAssign,
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
