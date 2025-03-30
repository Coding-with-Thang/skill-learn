import { create } from "zustand";
import api from "@/utils/axios";

const useCategoryStore = create((set) => ({
  categories: [],
  quizzesPerCategory: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/categories"); //Calls Next.js API
      set({ categories: response.data.categories, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch categories", loading: false });
    }
  },

  fetchQuizzesPerCategory: async () => {
    set({ loading: true, error: null });
    try {
      const { response } = await api.get("/categories/count-per-category");
      set({ quizzesPerCategory: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch categories", loading: false });
    }
  },
}));

export default useCategoryStore;
