import { create } from "zustand";
import api from "../../utils/axios";
import { parseApiError } from "../../utils/apiResponseParser";

interface ProgressStore {
  currentModule: { type: string; id: string } | null;
  isLoading: boolean;
  error: string | null;
  stats: { completed: number; inProgress: number };
  fetchProgress: () => Promise<void>;
  resumeTraining: (router: { push: (url: string) => void }) => Promise<void>;
  reset: () => void;
}

/**
 * Progress Store - Manages user training progress data
 */
export const useProgressStore = create<ProgressStore>((set, get) => ({
  currentModule: null,
  isLoading: false,
  error: null,
  stats: {
    completed: 0,
    inProgress: 0,
  },

  // Fetch user's current progress and stats
  fetchProgress: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user/progress");
      set({
        currentModule: response.data.currentModule || null,
        stats: {
          completed: response.data.completed || 0,
          inProgress: response.data.inProgress || 0,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: parseApiError(error) || "Failed to fetch progress",
        isLoading: false,
        currentModule: null,
      });
    }
  },

  // Resume training - navigate to current module
  resumeTraining: async (router) => {
    const { currentModule } = get();
    if (!currentModule) return;

    try {
      // Navigate to the module/quiz
      if (currentModule.type === "quiz") {
        router.push(`/quiz/start/${currentModule.id}`);
      } else {
        // For non-quiz modules, navigate to training page
        router.push(`/training`);
      }
    } catch (error: unknown) {
      set({ error: error instanceof Error ? error.message : "Failed to resume" });
    }
  },

  // Reset store
  reset: () =>
    set({
      currentModule: null,
      isLoading: false,
      error: null,
      stats: { completed: 0, inProgress: 0 },
    }),
}));
