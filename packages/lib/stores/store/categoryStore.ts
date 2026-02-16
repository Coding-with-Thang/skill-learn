import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../utils/axios";
import { handleErrorWithNotification } from "../../utils/notifications";
import { createRequestDeduplicator } from "../../utils/requestDeduplication";
import { parseApiResponse, parseApiError } from "../../utils/apiResponseParser";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 5000, // 5 seconds
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

interface CategoryStore {
  categories: unknown[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  fetchCategories: (force?: boolean) => Promise<unknown[]>;
  reset: () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
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
              // API returns standardized format: { success: true, data: { categories: [...] } }
              const raw = parseApiResponse(response, "categories");
              const categories = Array.isArray(raw) ? raw : [];
              set({
                categories,
                isLoading: false,
                lastFetch: Date.now(),
              });
              return categories;
            } catch (error) {
              handleErrorWithNotification(error, "Failed to load categories");
              set({
                error: parseApiError(error) || "Failed to fetch categories",
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
      partialize: (state: CategoryStore) => ({
        categories: state.categories,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
