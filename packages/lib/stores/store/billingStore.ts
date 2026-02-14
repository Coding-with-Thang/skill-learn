import { create } from "zustand";
import api from "../../utils/axios";
import { handleErrorWithNotification } from "../../utils/notifications";
import { createRequestDeduplicator } from "../../utils/requestDeduplication";
import { parseApiResponse, parseApiError } from "../../utils/apiResponseParser";
import { retryWithBackoff } from "../../utils/retry";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 30000, // 30 seconds - billing data changes infrequently
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

/**
 * Billing Store
 * Manages billing and subscription data for LMS tenants
 */
export const useBillingStore = create((set, get) => ({
  // State
  billing: null,
  subscription: null,
  tenant: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0, // Track retry attempts for UI feedback

  // Fetch all billing data (billing + subscription)
  fetchBillingData: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchBillingData",
      async () => {
        set({ isLoading: true, error: null, retryCount: 0 });
        try {
          // Fetch both in parallel with retry
          const [billingRes, subscriptionRes] = await retryWithBackoff(
            () => Promise.all([
              api.get("/tenant/billing"),
              api.get("/stripe/subscription"),
            ]),
            {
              maxRetries: 3,
              baseDelay: 1000,
              onRetry: (attempt, error, delay) => {
                set({ retryCount: attempt });
                console.log(`Retrying fetchBillingData (attempt ${attempt}/${3}) after ${delay}ms`);
              },
            }
          );

          const billing = parseApiResponse(billingRes, "billing");
          const subscription = parseApiResponse(subscriptionRes);

          set({
            billing,
            subscription,
            isLoading: false,
            lastUpdated: Date.now(),
            retryCount: 0,
          });

          return { billing, subscription };
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load billing data");
          set({
            error:
              parseApiError(error) || "Failed to fetch billing data",
            isLoading: false,
            retryCount: 0,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Fetch tenant data (used in TenantSummary)
  fetchTenant: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchTenant",
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/tenant");
          const tenant = parseApiResponse(response, "tenant");

          set({
            tenant,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return tenant;
        } catch (error) {
          console.error("Error loading tenant:", error);
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

  // Fetch tenant and billing together (optimized for TenantSummary)
  fetchTenantAndBilling: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchTenantAndBilling",
      async () => {
        set({ isLoading: true, error: null });
        try {
          const [tenantRes, billingRes] = await Promise.all([
            api.get("/tenant"),
            api.get("/tenant/billing"),
          ]);

          const tenant = parseApiResponse(tenantRes, "tenant");
          const billing = parseApiResponse(billingRes, "billing");

          set({
            tenant,
            billing,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return { tenant, billing };
        } catch (error) {
          console.error("Error loading tenant and billing:", error);
          set({
            error:
              parseApiError(error) || "Failed to fetch tenant and billing",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Open Stripe billing portal
  openBillingPortal: async () => {
    try {
      const response = await api.post("/stripe/portal");

      if (response.data.error) {
        throw new Error(response.data.error || "Failed to open billing portal");
      }

      // Redirect to portal
      if (response.data.url) {
        window.location.href = response.data.url;
      }

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to open billing portal");
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.patch("/stripe/subscription", { action: "cancel" });

      if (response.data.error) {
        throw new Error(response.data.error || "Failed to cancel subscription");
      }

      // Refresh billing data
      await get().fetchBillingData(true);

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to cancel subscription");
      throw error;
    }
  },

  // Resume subscription
  resumeSubscription: async () => {
    try {
      const response = await api.patch("/stripe/subscription", { action: "resume" });

      if (response.data.error) {
        throw new Error(response.data.error || "Failed to resume subscription");
      }

      // Refresh billing data
      await get().fetchBillingData(true);

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to resume subscription");
      throw error;
    }
  },

  // Reset store
  reset: () =>
    set({
      billing: null,
      subscription: null,
      tenant: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
    }),
}));
