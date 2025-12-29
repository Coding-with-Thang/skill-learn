import { create } from "zustand";
import api from "@/utils/axios";
import { STORE } from "@/constants";
import { handleErrorWithNotification } from "@/utils/notifications";

// Request deduplication
let fetchPromise = null;

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

    // If there's an ongoing fetch, return its promise
    if (fetchPromise) {
      return fetchPromise;
    }

    try {
      set({ isLoading: true });

      // Create a new fetch promise
      fetchPromise = Promise.all([
        api.get("/user/points/daily-status"),
        api.get("/user/streak"),
      ])
        .then(([pointsResponse, streakResponse]) => {
          // All APIs return { success: true, data: {...} }
          const pointsData = pointsResponse.data?.data || pointsResponse.data;
          const streakData = streakResponse.data?.data || streakResponse.data;

          const data = {
            dailyStatus: pointsData,
            points: pointsData?.user?.points || 0,
            lifetimePoints: pointsData?.user?.lifetimePoints || 0,
            streak: streakData,
          };

          set({
            ...data,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return data;
        })
        .catch((error) => {
          handleErrorWithNotification(error, "Failed to load user data");
          set({
            isLoading: false,
            dailyStatus: {
              todaysPoints: 0,
              canEarnPoints: true,
              lifetimePoints: 0,
            },
            points: 0,
            lifetimePoints: 0,
          });
          throw error;
        })
        .finally(() => {
          fetchPromise = null;
        });

      return fetchPromise;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to load user data");
      set({ isLoading: false });
      throw error;
    }
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
