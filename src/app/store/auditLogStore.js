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

      // Build query string manually to avoid URLSearchParams issues
      let queryParams = `page=${page}&limit=50`;

      if (filters.resource)
        queryParams += `&resource=${encodeURIComponent(filters.resource)}`;
      if (filters.action)
        queryParams += `&action=${encodeURIComponent(filters.action)}`;
      if (filters.startDate)
        queryParams += `&startDate=${encodeURIComponent(filters.startDate)}`;
      if (filters.endDate)
        queryParams += `&endDate=${encodeURIComponent(filters.endDate)}`;

      const response = await api.get(`/admin/audit-logs?${queryParams}`);

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
