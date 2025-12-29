import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/axios";
import { extractField } from "@/utils/apiResponseAdapter";

export const useCategoryStore = create(
  persist(
    (set) => ({
      categories: [],
      isLoading: false,
      error: null,
      lastFetch: null,

      fetchCategories: async (force = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/categories");
          if (!response.data) {
            throw new Error("No data received from server");
          }
          // Use adapter to handle both old and new response formats
          const categories = extractField(response, "categories") || [];
          set({
            categories,
            isLoading: false,
            lastFetch: Date.now(),
          });
        } catch (error) {
          console.error("Category fetch error:", error);
          set({
            error:
              error.response?.data?.error || error.response?.data?.message || "Failed to fetch categories",
            isLoading: false,
          });
        }
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
