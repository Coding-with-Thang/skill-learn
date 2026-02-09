import { create } from "zustand";
import api from "../../utils/axios.js";
import { handleErrorWithNotification } from "../../utils/notifications.js";
import { createRequestDeduplicator } from "../../utils/requestDeduplication.js";
import { parseApiResponse } from "../../utils/apiResponseParser.js";
import { retryWithBackoff } from "../../utils/retry.js";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 10000, // 10 seconds
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

/**
 * User Roles Store
 * Manages user role assignments for LMS tenants
 */
export const useUserRolesStore = create((set, get) => ({
  // State
  userRoles: [],
  roles: [], // Active roles only
  users: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0, // Track retry attempts for UI feedback

  // Fetch all user role assignments
  fetchUserRoles: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchUserRoles",
      async () => {
        set({ isLoading: true, error: null, retryCount: 0 });
        try {
          const response = await retryWithBackoff(
            () => api.get("/tenant/user-roles"),
            {
              maxRetries: 3,
              baseDelay: 1000,
              onRetry: (attempt, error, delay) => {
                set({ retryCount: attempt });
                console.log(`Retrying fetchUserRoles (attempt ${attempt}/${3}) after ${delay}ms`);
              },
            }
          );
          const userRoles = parseApiResponse(response, "userRoles") || [];

          set({
            userRoles,
            isLoading: false,
            lastUpdated: Date.now(),
            retryCount: 0,
          });

          return userRoles;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load user roles");
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to fetch user roles",
            isLoading: false,
            retryCount: 0,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch roles (active only, for assignment dropdown)
  fetchRoles: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchRolesForUserRoles",
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
          const roles = (data.roles || []).filter((r) => r.isActive);

          set({
            roles,
            isLoading: false,
            lastUpdated: Date.now(),
            retryCount: 0,
          });

          return roles;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load roles");
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to fetch roles",
            isLoading: false,
            retryCount: 0,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch users (for assignment dropdown)
  fetchUsers: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchUsersForUserRoles",
      async () => {
        set({ isLoading: true, error: null, retryCount: 0 });
        try {
          const response = await retryWithBackoff(
            () => api.get("/users"),
            {
              maxRetries: 3,
              baseDelay: 1000,
              onRetry: (attempt, error, delay) => {
                set({ retryCount: attempt });
                console.log(`Retrying fetchUsers (attempt ${attempt}/${3}) after ${delay}ms`);
              },
            }
          );
          const users = parseApiResponse(response, "users") || [];

          set({
            users,
            isLoading: false,
            lastUpdated: Date.now(),
            retryCount: 0,
          });

          return users;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load users");
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to fetch users",
            isLoading: false,
            retryCount: 0,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch all data (userRoles, roles, users)
  fetchAll: async (force = false) => {
    try {
      await Promise.all([
        get().fetchUserRoles(force),
        get().fetchRoles(force),
        get().fetchUsers(force),
      ]);
    } catch (error) {
      // Individual errors are handled by respective methods
      throw error;
    }
  },

  // Assign role to user
  assignRole: async (userId, tenantRoleId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/tenant/user-roles", {
        userId,
        tenantRoleId,
      });

      if (response.data.error) {
        throw new Error(response.data.error || "Failed to assign role");
      }

      // Refresh user roles
      await get().fetchUserRoles(true);

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to assign role");
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to assign role",
        isLoading: false,
      });
      throw error;
    }
  },

  // Remove role assignment
  removeRole: async (userRoleId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete("/tenant/user-roles", {
        params: { userRoleId },
      });

      if (response.data.error) {
        throw new Error(response.data.error || "Failed to remove role");
      }

      // Refresh user roles
      await get().fetchUserRoles(true);

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to remove role");
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to remove role",
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset store
  reset: () =>
    set({
      userRoles: [],
      roles: [],
      users: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      retryCount: 0,
    }),
}));
