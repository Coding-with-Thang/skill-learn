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

/** Store state + actions type so get() is typed inside create() */
interface TenantsStore {
  tenants: unknown[];
  currentTenant: unknown | null;
  users: unknown[];
  roles: unknown[];
  userRoles: unknown[];
  features: unknown[];
  featuresByCategory: Record<string, unknown>;
  allTenants: unknown[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  retryCount: number;
  fetchTenants: (force?: boolean) => Promise<unknown>;
  fetchTenant: (tenantId: string, force?: boolean) => Promise<unknown>;
  fetchUsers: (tenantId: string, force?: boolean) => Promise<unknown>;
  fetchRoles: (tenantId: string, force?: boolean) => Promise<unknown>;
  fetchUserRoles: (tenantId: string, force?: boolean) => Promise<unknown>;
  fetchFeatures: (tenantId: string, force?: boolean) => Promise<{ features: unknown[]; featuresByCategory: Record<string, unknown> }>;
  createTenant: (tenantData: unknown) => Promise<unknown>;
  updateTenant: (tenantId: string, tenantData: unknown) => Promise<unknown>;
  deleteTenant: (tenantId: string) => Promise<void>;
  reset: () => void;
}

/**
 * Tenants Store
 * Manages tenants for CMS super admin
 */
export const useTenantsStore = create<TenantsStore>((set, get) => ({
  // State
  tenants: [],
  currentTenant: null,
  users: [],
  roles: [],
  userRoles: [],
  features: [],
  featuresByCategory: {},
  allTenants: [], // For tenant selection dropdowns
  isLoading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0, // Track retry attempts for UI feedback

  // Fetch all tenants
  fetchTenants: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchTenants",
      async () => {
        set({ isLoading: true, error: null, retryCount: 0 });
        try {
          const response = await retryWithBackoff(
            () => api.get("/tenants"),
            {
              maxRetries: 3,
              baseDelay: 1000,
              onRetry: (attempt, error, delay) => {
                set({ retryCount: attempt });
                console.log(`Retrying fetchTenants (attempt ${attempt}/${3}) after ${delay}ms`);
              },
            }
          );
          const raw = parseApiResponse(response, "tenants");
          const tenants: unknown[] = Array.isArray(raw) ? raw : [];

          set({
            tenants,
            allTenants: tenants,
            isLoading: false,
            lastUpdated: Date.now(),
            retryCount: 0,
          });

          return tenants;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load tenants");
          set({
            error:
              parseApiError(error) || "Failed to fetch tenants",
            isLoading: false,
            retryCount: 0,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch specific tenant details
  fetchTenant: async (tenantId, force = false) => {
    return requestDeduplicator.dedupe(
      `fetchTenant-${tenantId}`,
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tenants/${tenantId}`);
          const tenant = parseApiResponse(response, "tenant");

          set({
            currentTenant: tenant,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return tenant;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load tenant");
          set({
            error:
              parseApiError(error) || "Failed to fetch tenant",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch users for tenant
  fetchUsers: async (tenantId, force = false) => {
    return requestDeduplicator.dedupe(
      `fetchUsers-${tenantId}`,
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tenants/${tenantId}/users`);
          const rawUsers = parseApiResponse(response, "users");
          const users: unknown[] = Array.isArray(rawUsers) ? rawUsers : [];

          set({
            users,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return users;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load users");
          set({
            error:
              parseApiError(error) || "Failed to fetch users",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch roles for tenant
  fetchRoles: async (tenantId, force = false) => {
    return requestDeduplicator.dedupe(
      `fetchRoles-${tenantId}`,
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tenants/${tenantId}/roles`);
          const rawRoles = parseApiResponse(response, "roles");
          const roles: unknown[] = Array.isArray(rawRoles) ? rawRoles : [];

          set({
            roles,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return roles;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load roles");
          set({
            error:
              parseApiError(error) || "Failed to fetch roles",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch user roles for tenant
  fetchUserRoles: async (tenantId, force = false) => {
    return requestDeduplicator.dedupe(
      `fetchUserRoles-${tenantId}`,
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tenants/${tenantId}/user-roles`);
          const rawUserRoles = parseApiResponse(response, "userRoles");
          const userRoles: unknown[] = Array.isArray(rawUserRoles) ? rawUserRoles : [];

          set({
            userRoles,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return userRoles;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load user roles");
          set({
            error:
              parseApiError(error) || "Failed to fetch user roles",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch features for tenant
  fetchFeatures: async (tenantId, force = false) => {
    return requestDeduplicator.dedupe(
      `fetchFeatures-${tenantId}`,
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/tenants/${tenantId}/features`);
          const data = parseApiResponse(response) as { features?: unknown[]; groupedByCategory?: Record<string, unknown> };
          const features: unknown[] = Array.isArray(data?.features) ? data.features : [];
          const featuresByCategory: Record<string, unknown> = data?.groupedByCategory && typeof data.groupedByCategory === "object" ? data.groupedByCategory : {};

          set({
            features,
            featuresByCategory,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return { features, featuresByCategory };
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load features");
          set({
            error:
              parseApiError(error) || "Failed to fetch features",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Create tenant
  createTenant: async (tenantData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/tenants", tenantData);
      const tenant = parseApiResponse(response, "tenant");

      // Refresh tenants list
      await get().fetchTenants(true);

      return tenant;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to create tenant");
      set({
        error:
          parseApiError(error) || "Failed to create tenant",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update tenant
  updateTenant: async (tenantId, tenantData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/tenants/${tenantId}`, tenantData);
      const tenant = parseApiResponse(response, "tenant");

      // Refresh tenants list and current tenant
      await Promise.all([
        get().fetchTenants(true),
        get().fetchTenant(tenantId, true),
      ]);

      return tenant;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to update tenant");
      set({
        error:
          parseApiError(error) || "Failed to update tenant",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete tenant
  deleteTenant: async (tenantId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/tenants/${tenantId}`);

      // Refresh tenants list
      await get().fetchTenants(true);
    } catch (error) {
      handleErrorWithNotification(error, "Failed to delete tenant");
      set({
        error:
          parseApiError(error) || "Failed to delete tenant",
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset store
  reset: () =>
    set({
      tenants: [],
      currentTenant: null,
      users: [],
      roles: [],
      userRoles: [],
      features: [],
      featuresByCategory: {},
      allTenants: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    }),
}));
