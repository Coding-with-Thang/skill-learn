import { create } from "zustand";
import api from "@/utils/axios";

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

  fetchLogs: async (page = 1) => {
    try {
      set({ isLoading: true });
      const filters = get().filters;

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      if (filters.resource) params.append("resource", filters.resource);
      if (filters.action) params.append("action", filters.action);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await api.get(`/admin/audit-logs?${params}`);

      set({
        logs: response.data.logs,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().fetchLogs(1); // Reset to first page with new filters
  },
}));
