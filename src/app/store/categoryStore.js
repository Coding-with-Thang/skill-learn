import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/axios";
import { handleErrorWithNotification } from "@/utils/notifications";
import { createRequestDeduplicator } from "@/utils/requestDeduplication";
import { STORE } from "@/constants";

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

export const useCategoryStore = create(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,
      lastFetch: null,

      fetchCategories: async (force = false) => {
        return requestDeduplicator.dedupe(
          "fetchCategories",
          async () => {
            set({ isLoading: true, error: null });
            try {
              const response = await api.get("/categories");
              if (!response.data) {
                throw new Error("No data received from server");
              }
              // API returns { success: true, data: { categories: [...] } }
              const responseData = response.data?.data || response.data;
              const categories = responseData?.categories || responseData || [];
              set({
                categories,
                isLoading: false,
                lastFetch: Date.now(),
              });
              return categories;
            } catch (error) {
              handleErrorWithNotification(error, "Failed to load categories");
              set({
                error:
                  error.response?.data?.error ||
                  error.response?.data?.message ||
                  "Failed to fetch categories",
                isLoading: false,
              });
              throw error;
            }
          },
          { force, cooldown: STORE.FETCH_COOLDOWN }
        );
      },

      reset: () => {
        set({
          categories: [],
          isLoading: false,
          error: null,
          lastFetch: null,
        });
      },
    }),
    {
      name: "category-store",
      partialize: (state) => ({
        categories: state.categories,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
