import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCoursesStore = create(
  persist(
    (set) => ({
      category: "",
      pageSize: 5,
      currentPage: 1,
      selectedCourseId: null,
      previewImageUrl: null,

      setCategory: (c) => set(() => ({ category: c, currentPage: 1 })),
      setPageSize: (n) => set(() => ({ pageSize: n, currentPage: 1 })),
      setCurrentPage: (p) => set(() => ({ currentPage: p })),
      setSelectedCourseId: (id) => set(() => ({ selectedCourseId: id })),
      setPreviewImageUrl: (url) => set(() => ({ previewImageUrl: url })),
      resetFilters: () =>
        set(() => ({ category: "", pageSize: 5, currentPage: 1 })),
    }),
    {
      name: "courses-storage",
      // Use localStorage on the client only. If undefined during SSR, persist will be noop.
      getStorage: () =>
        typeof window !== "undefined" ? window.localStorage : undefined,
    }
  )
);

