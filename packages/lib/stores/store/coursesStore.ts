import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const noopStorage = {
  getItem: () => null as string | null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCoursesStore = create(
  persist(
    (set) => ({
      category: "",
      pageSize: 5,
      currentPage: 1,
      selectedCourseId: null as string | null,
      previewImageUrl: null as string | null,

      setCategory: (c: string) => set(() => ({ category: c, currentPage: 1 })),
      setPageSize: (n: number) => set(() => ({ pageSize: n, currentPage: 1 })),
      setCurrentPage: (p: number) => set(() => ({ currentPage: p })),
      setSelectedCourseId: (id: string | null) => set(() => ({ selectedCourseId: id })),
      setPreviewImageUrl: (url: string | null) => set(() => ({ previewImageUrl: url })),
      resetFilters: () =>
        set(() => ({ category: "", pageSize: 5, currentPage: 1 })),
    }),
    {
      name: "courses-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
    }
  )
);

