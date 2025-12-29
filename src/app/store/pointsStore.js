import { create } from "zustand";
import api from "@/utils/axios";
import { STORE } from "@/constants";
import { handleErrorWithNotification } from "@/utils/notifications";
import { createRequestDeduplicator } from "@/utils/requestDeduplication";

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

export const usePointsStore = create((set, get) => ({
  points: 0,
  lifetimePoints: 0,
  dailyStatus: null,
  streak: {
    current: 0,
    longest: 0,
    atRisk: false,
    nextMilestone: 5,
    pointsToNextMilestone: 5,
  },
  isLoading: false,
  lastUpdated: null,

  // Combined fetch function to get all user data at once
  fetchUserData: async (force = false) => {
    const now = Date.now();
    const state = get();

    // Return cached data if available and not forced
    if (
      !force &&
      state.lastUpdated &&
      now - state.lastUpdated < STORE.FETCH_COOLDOWN
    ) {
      return {
        points: state.points,
        lifetimePoints: state.lifetimePoints,
        dailyStatus: state.dailyStatus,
        streak: state.streak,
      };
    }

    // Use request deduplication utility with new consolidated dashboard endpoint
    return requestDeduplicator.dedupe(
      "fetchUserData",
      async () => {
        set({ isLoading: true });

        try {
          // Use new consolidated dashboard endpoint (combines points + streak)
          const response = await api.get("/user/dashboard");
          const responseData = response.data?.data || response.data;

          const data = {
            dailyStatus: responseData.dailyStatus,
            points: responseData.points || 0,
            lifetimePoints: responseData.lifetimePoints || 0,
            streak: responseData.streak,
          };

          set({
            ...data,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return data;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load user data");
          set({
            isLoading: false,
            dailyStatus: {
              todaysPoints: 0,
              canEarnPoints: true,
              lifetimePoints: 0,
              dailyLimit: 0,
              todaysLogs: [],
            },
            points: 0,
            lifetimePoints: 0,
            streak: {
              current: 0,
              longest: 0,
              atRisk: false,
              nextMilestone: 5,
              pointsToNextMilestone: 5,
            },
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  addPoints: async (amount, reason) => {
    try {
      set({ isLoading: true });

      const response = await api.post("/user/points/add", {
        amount,
        reason,
      });

      // Force refresh user data
      await get().fetchUserData(true);

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to add points");
      set({ isLoading: false });
      throw error;
    }
  },

  spendPoints: async (amount, reason) => {
    try {
      const { points } = get();

      if (points < amount) {
        return false;
      }

      set({ isLoading: true });

      const response = await api.post("/user/points/spend", { amount, reason });

      // Force refresh user data
      await get().fetchUserData(true);

      return true;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to spend points");
      set({ isLoading: false });
      return false;
    }
  },
}));
