import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/utils/axios";

const useCategoryStore = create(
  persist(
    (set) => ({
      categories: [],
      loading: false,
      error: null,
      lastFetch: null,

      fetchCategories: async (force = false) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get("/categories");
          if (!response.data) {
            throw new Error("No data received from server");
          }
          set({
            categories: response.data.categories,
            loading: false,
            lastFetch: Date.now(),
          });
        } catch (error) {
          console.error("Category fetch error:", error);
          set({
            error:
              error.response?.data?.message || "Failed to fetch categories",
            loading: false,
          });
        }
      },

      reset: () => {
        set({
          categories: [],
          loading: false,
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

export default useCategoryStore;
