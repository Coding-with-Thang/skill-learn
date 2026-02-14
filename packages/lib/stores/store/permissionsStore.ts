import { create } from "zustand";
import api from "../../utils/axios";
import { handleErrorWithNotification } from "../../utils/notifications";
import { createRequestDeduplicator } from "../../utils/requestDeduplication";
import { parseApiResponse, parseApiError } from "../../utils/apiResponseParser";
import { retryWithBackoff } from "../../utils/retry";

type PermissionsState = {
  permissions: string[];
  permissionsByCategory: Record<string, unknown[]>;
  tenantPermissions: unknown[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  retryCount: number;
  fetchPermissions: (tenantId?: string | null, force?: boolean) => Promise<unknown>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissionList: string[]) => boolean;
  hasAllPermissions: (permissionList: string[]) => boolean;
  can: (resource: string, action: string) => boolean;
  getPermissionsForCategory: (category: string) => unknown[];
  hasAccessToCategory: (category: string) => boolean;
  canCreate: (resource: string) => boolean;
  canRead: (resource: string) => boolean;
  canUpdate: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  canPublish: (resource: string) => boolean;
  canAssign: (resource: string) => boolean;
  reset: () => void;
};

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 60000, // 60 seconds - permissions change infrequently
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

/**
 * Permissions Store
 * Manages user permissions and permission checks
 * Replaces usePermissions hook for better performance and shared state
 */
export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  // State
  permissions: [],
  permissionsByCategory: {},
  tenantPermissions: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0, // Track retry attempts for UI feedback

  // Fetch permissions from API
  fetchPermissions: async (tenantId = null, force = false) => {
    return requestDeduplicator.dedupe(
      `fetchPermissions-${tenantId || "default"}`,
      async () => {
        set({ isLoading: true, error: null, retryCount: 0 });
        try {
          const url = tenantId
            ? `/user-permissions?tenantId=${tenantId}`
            : "/user-permissions";

          const response = await retryWithBackoff(
            () => api.get(url),
            {
              maxRetries: 3,
              baseDelay: 1000,
              onRetry: (attempt, error, delay) => {
                set({ retryCount: attempt });
                console.log(`Retrying fetchPermissions (attempt ${attempt}/${3}) after ${delay}ms`);
              },
            }
          );
          const data = parseApiResponse(response);

          set({
            permissions: data.allPermissions || [],
            permissionsByCategory: data.permissionsByCategory || {},
            tenantPermissions: data.tenantPermissions || [],
            isLoading: false,
            lastUpdated: Date.now(),
            retryCount: 0,
          });

          return {
            permissions: data.allPermissions || [],
            permissionsByCategory: data.permissionsByCategory || {},
            tenantPermissions: data.tenantPermissions || [],
          };
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load permissions");
          set({
            error: parseApiError(error) || "Failed to fetch permissions",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Permission checking helpers
  hasPermission: (permission) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  hasAnyPermission: (permissionList) => {
    const { permissions } = get();
    const permissionSet = new Set(permissions);
    return permissionList.some((p) => permissionSet.has(p));
  },

  hasAllPermissions: (permissionList) => {
    const { permissions } = get();
    const permissionSet = new Set(permissions);
    return permissionList.every((p) => permissionSet.has(p));
  },

  can: (resource, action) => {
    const { permissions } = get();
    const permission = `${resource}.${action}`;
    return permissions.includes(permission);
  },

  getPermissionsForCategory: (category) => {
    const { permissionsByCategory } = get();
    return permissionsByCategory[category] || [];
  },

  hasAccessToCategory: (category) => {
    const { permissionsByCategory } = get();
    const categoryPermissions = permissionsByCategory[category] || [];
    return categoryPermissions.length > 0;
  },

  // Convenience checks for common operations
  canCreate: (resource) => get().can(resource, "create"),
  canRead: (resource) => get().can(resource, "read"),
  canUpdate: (resource) => get().can(resource, "update"),
  canDelete: (resource) => get().can(resource, "delete"),
  canPublish: (resource) => get().can(resource, "publish"),
  canAssign: (resource) => get().can(resource, "assign"),

  // Reset store
  reset: () =>
    set({
      permissions: [],
      permissionsByCategory: {},
      tenantPermissions: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      retryCount: 0,
    }),
}));
