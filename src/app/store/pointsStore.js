import { create } from "zustand";
import api from "@/utils/axios";

export const usePointsStore = create((set, get) => ({
  points: 0,
  lifetimePoints: 0,
  dailyStatus: null,
  isLoading: false,

  fetchDailyStatus: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get("/user/points/daily-status");
      set({
        dailyStatus: response.data,
        points: response.data.user.points,
        lifetimePoints: response.data.user.lifetimePoints,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching daily status:", error);
      set({ isLoading: false });
      return null;
    }
  },

  fetchPoints: async () => {
    try {
      set({ isLoading: true });

      const response = await api.get("/user/points");

      set({
        points: response.data.points,
        lifetimePoints: response.data.lifetimePoints,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching points:", error);
      set({ isLoading: false });
    }
  },

  addPoints: async (amount, reason) => {
    try {
      set({ isLoading: true });

      // Make API call to add points using axios
      const response = await api.post("/user/points/add", {
        amount,
        reason,
      });

      // Update local state
      set({
        points: response.data.points,
        lifetimePoints: response.data.lifetimePoints,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error adding points:", error);
      set({ isLoading: false });
    }
  },

  spendPoints: async (amount, reason) => {
    try {
      const { points } = get();

      // Check if user has enough points
      if (points < amount) {
        return false;
      }

      set({ isLoading: true });

      // Make API call to spend points using axios
      const response = await api.post("/user/points/spend", { amount, reason });

      // Update local state
      set({
        points: response.data.points,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error("Error spending points:", error);
      set({ isLoading: false });
      return false;
    }
  },
}));
