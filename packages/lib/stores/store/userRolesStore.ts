import { create } from "zustand";
import api from "../../utils/axios";
import { handleErrorWithNotification } from "../../utils/notifications";
import { createRequestDeduplicator } from "../../utils/requestDeduplication";
import { parseApiResponse, parseApiError } from "../../utils/apiResponseParser";
import { retryWithBackoff } from "../../utils/retry";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 10000, // 10 seconds
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

/** Store state + actions type so get() is typed */
interface UserRolesStore {
  userRoles: unknown[];
  roles: unknown[];
  users: unknown[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  retryCount: number;
  fetchUserRoles: (force?: boolean) => Promise<unknown>;
  fetchRoles: (force?: boolean) => Promise<unknown>;
  fetchUsers: (force?: boolean) => Promise<unknown>;
  fetchAll: (force?: boolean) => Promise<void>;
  assignRole: (userId: string, tenantRoleId: string) => Promise<unknown>;
  removeRole: (userRoleId: string) => Promise<void>;
  reset: () => void;
}

/**
 * User Roles Store
 * Manages user role assignments for LMS tenants
 */
export const useUserRolesStore = create<UserRolesStore>((set, get) => ({
  userRoles: [],
  roles: [],
  users: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0,

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
          const raw = parseApiResponse(response, "userRoles");
          const userRoles = Array.isArray(raw) ? raw : [];

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
              parseApiError(error) || "Failed to fetch user roles",
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
          const data = parseApiResponse(response) as { roles?: { isActive?: boolean }[] } | null;
          const roles = (data?.roles ?? []).filter((r) => r.isActive);

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
              parseApiError(error) || "Failed to fetch roles",
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
          const raw = parseApiResponse(response, "users");
          const users = Array.isArray(raw) ? raw : [];

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
              parseApiError(error) || "Failed to fetch users",
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
          parseApiError(error) || "Failed to assign role",
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
          parseApiError(error) || "Failed to remove role",
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
