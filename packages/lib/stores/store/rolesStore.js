import { create } from "zustand";
import api from "../../utils/utils/axios.js";
import { handleErrorWithNotification } from "../../utils/utils/notifications.js";
import { createRequestDeduplicator } from "../../utils/utils/requestDeduplication.js";
import { parseApiResponse } from "../../utils/utils/apiResponseParser.js";
import { retryWithBackoff } from "../../utils/utils/retry.js";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 10000, // 10 seconds
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

/**
 * Roles Store
 * Manages roles for a tenant (used in both CMS and LMS)
 */
export const useRolesStore = create((set, get) => ({
  // State
  roles: [],
  permissions: [],
  permissionsByCategory: {},
  templates: [],
  tenant: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0, // Track retry attempts for UI feedback

  // Fetch roles for tenant (LMS - uses current tenant context)
  fetchRoles: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchRoles",
      async () => {
        set({ isLoading: true, error: null, retryCount: 0 });
        try {
          const response = await retryWithBackoff(
            () => api.get("/tenant/roles"),
            {
              maxRetries: 3,
              baseDelay: 1000,
              onRetry: (attempt, error, delay) => {
                set({ retryCount: attempt });
                console.log(`Retrying fetchRoles (attempt ${attempt}/${3}) after ${delay}ms`);
              },
            }
          );
          const data = parseApiResponse(response);

          set({
            roles: data.roles || [],
            tenant: data.tenant || null,
            isLoading: false,
            lastUpdated: Date.now(),
            retryCount: 0,
          });

          return { roles: data.roles || [], tenant: data.tenant };
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load roles");
          set({
            error: error.response?.data?.error || error.message || "Failed to fetch roles",
            isLoading: false,
            retryCount: 0,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch roles for specific tenant (CMS - super admin context)
  fetchRolesForTenant: async (tenantId, force = false) => {
    return requestDeduplicator.dedupe(
      `fetchRoles-${tenantId}`,
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tenants/${tenantId}/roles`);
          const data = parseApiResponse(response);

          set({
            roles: data.roles || [],
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return data.roles || [];
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load roles");
          set({
            error: error.response?.data?.error || error.message || "Failed to fetch roles",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch permissions for tenant
  fetchPermissions: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchTenantPermissions",
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/tenant/permissions");
          const data = parseApiResponse(response);

          const categories = data.categories || [];
          const expanded = {};
          categories.forEach((cat) => (expanded[cat] = true));

          set({
            permissions: data.permissions || [],
            permissionsByCategory: data.groupedByCategory || {},
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return {
            permissions: data.permissions || [],
            permissionsByCategory: data.groupedByCategory || {},
            categories,
            expandedCategories: expanded,
          };
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load permissions");
          set({
            error: error.response?.data?.error || error.message || "Failed to fetch permissions",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch role templates
  fetchTemplates: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchTemplates",
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/tenant/templates");
          const data = parseApiResponse(response);

          set({
            templates: data.templateSets || [],
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return data.templateSets || [];
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load templates");
          set({
            error: error.response?.data?.error || error.message || "Failed to fetch templates",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Create role
  createRole: async (roleData, tenantId = null) => {
    set({ isLoading: true, error: null });
    try {
      const url = tenantId ? `/tenants/${tenantId}/roles` : "/tenant/roles";
      const response = await api.post(url, roleData);

      // Refresh roles
      if (tenantId) {
        await get().fetchRolesForTenant(tenantId, true);
      } else {
        await get().fetchRoles(true);
      }

      return parseApiResponse(response, "role") || parseApiResponse(response);
    } catch (error) {
      handleErrorWithNotification(error, "Failed to create role");
      set({
        error: error.response?.data?.error || error.message || "Failed to create role",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update role
  updateRole: async (roleId, roleData, tenantId = null) => {
    set({ isLoading: true, error: null });
    try {
      const url = tenantId
        ? `/tenants/${tenantId}/roles/${roleId}`
        : `/tenant/roles/${roleId}`;
      const response = await api.put(url, roleData);

      // Refresh roles
      if (tenantId) {
        await get().fetchRolesForTenant(tenantId, true);
      } else {
        await get().fetchRoles(true);
      }

      return parseApiResponse(response, "role") || parseApiResponse(response);
    } catch (error) {
      handleErrorWithNotification(error, "Failed to update role");
      set({
        error: error.response?.data?.error || error.message || "Failed to update role",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete role
  deleteRole: async (roleId, tenantId = null) => {
    set({ isLoading: true, error: null });
    try {
      const url = tenantId
        ? `/tenants/${tenantId}/roles/${roleId}`
        : `/tenant/roles/${roleId}`;
      await api.delete(url);

      // Refresh roles
      if (tenantId) {
        await get().fetchRolesForTenant(tenantId, true);
      } else {
        await get().fetchRoles(true);
      }
    } catch (error) {
      handleErrorWithNotification(error, "Failed to delete role");
      set({
        error: error.response?.data?.error || error.message || "Failed to delete role",
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset store
  reset: () =>
    set({
      roles: [],
      permissions: [],
      permissionsByCategory: {},
      templates: [],
      tenant: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    }),
}));
