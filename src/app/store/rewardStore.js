import { create } from "zustand";
import api from "@/utils/axios";
export const useRewardStore = create((set, get) => ({
  rewards: [],
  isLoading: false,

  fetchRewards: async () => {
    try {
      set({ isLoading: true });

      const response = await api.get("/user/rewards");

      set({
        rewards: response.data.rewards,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching points:", error);
      set({ isLoading: false });
    }
  },

  addReward: async (prize, description, cost, imageUrl) => {
    try {
      set({ isLoading: true });

      // Make API call to add points using axios
      const response = await api.post("/user/rewards/add", {
        prize,
        description,
        cost,
        imageUrl,
      });

      // Update local state
      set({
        rewards: response.data.rewards,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error adding reward:", error);
      set({ isLoading: false });
    }
  },

  redeemReward: async (amount, reason) => {
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
