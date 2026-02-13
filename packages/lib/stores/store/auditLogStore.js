import { create } from "zustand";
import api from "../../utils/axios.js";
import { createRequestDeduplicator } from "../../utils/requestDeduplication.js";
import { parseApiResponse } from "../../utils/apiResponseParser.js";
// STORE constants - should be passed as parameter or defined here
const STORE = { 
  CACHE_DURATION: 5 * 60 * 1000,
  FETCH_COOLDOWN: 5000 // 5 seconds
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

export const useAuditLogStore = create((set, get) => ({
  logs: [],
  pagination: null,
  filters: {
    resource: null,
    action: null,
    startDate: null,
    endDate: null,
  },
  isLoading: false,

  fetchLogs: async (page = 1, force = false) => {
    const filters = get().filters;

    // Create unique key based on page and filters to deduplicate properly
    const cacheKey = `fetchLogs-${page}-${JSON.stringify(filters)}`;

    return requestDeduplicator.dedupe(
      cacheKey,
      async () => {
        try {
          set({ isLoading: true });

          // Build query string manually to avoid URLSearchParams issues
          let queryParams = `page=${page}&limit=50`;

          if (filters.resource)
            queryParams += `&resource=${encodeURIComponent(filters.resource)}`;
          if (filters.action)
            queryParams += `&action=${encodeURIComponent(filters.action)}`;
          if (filters.startDate)
            queryParams += `&startDate=${encodeURIComponent(
              filters.startDate
            )}`;
          if (filters.endDate)
            queryParams += `&endDate=${encodeURIComponent(filters.endDate)}`;

          const response = await api.get(`/admin/audit-logs?${queryParams}`);

          // API returns standardized format: { success: true, data: { logs, pagination } }
          const responseData = parseApiResponse(response);

          set({
            logs: responseData?.logs || [],
            pagination: responseData?.pagination || null,
            isLoading: false,
          });

          return {
            logs: responseData?.logs || [],
            pagination: responseData?.pagination || null,
          };
        } catch (error) {
          console.error("Error fetching audit logs:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().fetchLogs(1); // Reset to first page with new filters
  },
}));
