import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/axios";

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
          set({
            categories: response.data.categories,
            isLoading: false,
            lastFetch: Date.now(),
          });
        } catch (error) {
          console.error("Category fetch error:", error);
          set({
            error:
              error.response?.data?.message || "Failed to fetch categories",
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
