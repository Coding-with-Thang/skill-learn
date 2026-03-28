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
   * Reset a user's progress by scope: all | quiz | course | points.
   * Calls POST /admin/reset-progress.
   */
  resetUserProgress: (params: {
    userId: string;
    reason: string;
    scope: "all" | "quiz" | "course" | "points";
    quizId?: string;
    courseId?: string;
    resetPointsMode?: "none" | "total" | "logs";
    pointLogIds?: string[];
  }) => Promise<{ quizzesReset?: number; coursesReset?: number; pointsAdjustment?: { newPoints: number; delta: number } } | null>;
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
    reason,
    scope,
    quizId,
    courseId,
    resetPointsMode = "none",
    pointLogIds = [],
  }) => {
    set({ isLoading: true, error: null });

    try {
      const payload: {
        userId: string;
        reason: string;
        scope: "all" | "quiz" | "course" | "points";
        quizId?: string;
        courseId?: string;
        resetPointsMode: "none" | "total" | "logs";
        pointLogIds: string[];
      } = {
        userId,
        reason,
        scope,
        resetPointsMode:
          scope === "points" ? (resetPointsMode === "none" ? "total" : resetPointsMode) : resetPointsMode,
        pointLogIds: resetPointsMode === "logs" ? pointLogIds : [],
      };
      if (scope === "quiz" && quizId) payload.quizId = quizId;
      if (scope === "course" && courseId) payload.courseId = courseId;

      const response = await api.post("/admin/reset-progress", payload);

      const data = parseApiResponse(response) as
        | {
            message?: string;
            quizzesReset?: number;
            coursesReset?: number;
            pointsAdjustment?: { newPoints: number; delta: number } | null;
          }
        | null;

      set({ isLoading: false, error: null });
      if (!data) return null;
      const out: {
        quizzesReset?: number;
        coursesReset?: number;
        pointsAdjustment?: { newPoints: number; delta: number };
      } = {};
      if (data.quizzesReset !== undefined) out.quizzesReset = data.quizzesReset;
      if (data.coursesReset !== undefined) out.coursesReset = data.coursesReset;
      if (data.pointsAdjustment != null) out.pointsAdjustment = data.pointsAdjustment;
      return out;
    } catch (error) {
      set({
        isLoading: false,
        error: parseApiError(error) || "Failed to reset progress",
      });
      return null;
    }
  },
}));

