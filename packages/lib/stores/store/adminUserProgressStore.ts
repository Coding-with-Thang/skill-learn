import { create } from "zustand";
import api from "../../utils/axios";
import { parseApiError, parseApiResponse } from "../../utils/apiResponseParser";

export type AdminUserProgressStatus = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface AdminUserProgress {
  id: string;
  userId: string;
  moduleId: string;
  status: AdminUserProgressStatus;
  points: number;
  attempt: number;
  resetReason?: string | null;
  resetAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

type ProgressByUser = Record<string, AdminUserProgress[]>;

interface AdminUserProgressStore {
  progressByUser: ProgressByUser;
  isLoading: boolean;
  error: string | null;
  /**
   * Seed or replace the progress list for a given user.
   * Useful for admin pages that fetch progress separately and want the store
   * to handle local updates (e.g. after a reset).
   */
  setUserProgress: (userId: string, progress: AdminUserProgress[]) => void;
  /**
   * Reset a user's progress for a module.
   * Calls POST /admin/reset-progress and updates the local list (if present)
   * by archiving the previous attempt and adding the new one.
   */
  resetUserProgress: (params: {
    userId: string;
    moduleId: string;
    reason: string;
    resetPointsMode?: "none" | "total" | "logs";
    pointLogIds?: string[];
  }) => Promise<AdminUserProgress | null>;
}

export const useAdminUserProgressStore = create<AdminUserProgressStore>((set, get) => ({
  progressByUser: {},
  isLoading: false,
  error: null,

  setUserProgress: (userId, progress) =>
    set((state) => ({
      ...state,
      progressByUser: {
        ...state.progressByUser,
        [userId]: progress,
      },
    })),

  resetUserProgress: async ({
    userId,
    moduleId,
    reason,
    resetPointsMode = "none",
    pointLogIds = [],
  }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/admin/reset-progress", {
        userId,
        moduleId,
        reason,
        resetPointsMode,
        pointLogIds,
      });

      const data = parseApiResponse(response) as
        | {
            message?: string;
            archived?: AdminUserProgress;
            progress?: AdminUserProgress;
            pointsAdjustment?: { newPoints: number; delta: number } | null;
          }
        | null;

      const archived = data?.archived;
      const newProgress = data?.progress;

      if (!archived || !newProgress) {
        // Response did not contain expected payload; leave state but surface error
        const message =
          (data as { message?: string } | null)?.message ??
          "Reset progress response missing expected data";
        set({ isLoading: false, error: message });
        return null;
      }

      set((state) => {
        const existing = state.progressByUser[userId] ?? [];
        // Remove the old record by id (it is now archived and re-inserted)
        const filtered = existing.filter((p) => p.id !== archived.id);
        const updatedList = [...filtered, archived, newProgress].sort(
          (a, b) => a.attempt - b.attempt
        );

        return {
          ...state,
          isLoading: false,
          error: null,
          progressByUser: {
            ...state.progressByUser,
            [userId]: updatedList,
          },
        };
      });

      return newProgress;
    } catch (error) {
      set({
        isLoading: false,
        error: parseApiError(error) || "Failed to reset user progress",
      });
      return null;
    }
  },
}));

