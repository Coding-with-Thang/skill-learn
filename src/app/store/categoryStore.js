import { create } from "zustand";
import axios from "axios";

const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/categories"); // Calls Next.js API
      set({ categories: response.data.categories, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch categories", loading: false });
    }
  },
}));

export default useCategoryStore;
