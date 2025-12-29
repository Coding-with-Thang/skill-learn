import { create } from "zustand";
import api from "@/utils/axios";
import { toast } from "sonner";
import { usePointsStore } from "./pointsStore";

export const useRewardStore = create((set, get) => ({
  rewards: [],
  rewardHistory: [],
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
      console.error("Error fetching rewards:", error);
      set({ isLoading: false });
    }
  },

  addReward: async (data) => {
    try {
      set({ isLoading: true });
      const response = await api.post("/user/rewards/add", data);

      // Refresh rewards list
      await get().fetchRewards();

      return true;
    } catch (error) {
      console.error("Error adding reward:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  redeemReward: async (rewardId) => {
    try {
      const response = await api.post("/user/rewards/redeem", { rewardId });

      // Parallel fetch: Update points, rewards, and reward history simultaneously
      const pointsStore = usePointsStore.getState();
      await Promise.all([
        pointsStore.fetchUserData(true), // Force refresh points after redemption
        get().fetchRewards(),
        get().fetchRewardHistory(),
      ]);

      return response.data;
    } catch (error) {
      console.error("Error redeeming reward:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      }
      throw error; // Re-throw the error to be handled by the component
    }
  },

  fetchRewardHistory: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get("/user/rewards/history");
      set({
        rewardHistory: response.data.history,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching reward history:", error);
      set({ isLoading: false });
    }
  },

  updateReward: async (id, updateData) => {
    try {
      set({ isLoading: true });

      // Format the data
      const formattedData = {
        ...updateData,
        cost: parseInt(updateData.cost, 10),
        maxRedemptions: updateData.maxRedemptions
          ? parseInt(updateData.maxRedemptions, 10)
          : null,
      };

      const response = await api.put("/user/rewards/update", {
        id,
        ...formattedData,
      });

      // Refresh the rewards list after update
      await get().fetchRewards();
      return true;
    } catch (error) {
      console.error("Error updating reward:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
