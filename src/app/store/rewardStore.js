import { create } from "zustand";
import api from "@/utils/axios";
import { toast } from "sonner";
import { usePointsStore } from "./pointsStore";
import { handleErrorWithNotification } from "@/utils/notifications";

export const useRewardStore = create((set, get) => ({
  rewards: [],
  rewardHistory: [],
  isLoading: false,

  fetchRewards: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get("/user/rewards");
      // API returns { success: true, data: { rewards: [...] } }
      const responseData = response.data?.data || response.data;
      const rewards = responseData?.rewards || responseData || [];
      set({
        rewards,
        isLoading: false,
      });
    } catch (error) {
      handleErrorWithNotification(error, "Failed to load rewards");
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
      handleErrorWithNotification(error, "Failed to add reward");
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
      handleErrorWithNotification(error, "Failed to redeem reward");
      throw error; // Re-throw the error to be handled by the component
    }
  },

  fetchRewardHistory: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get("/user/rewards/history");
      // API returns { success: true, data: { history: [...] } }
      const responseData = response.data?.data || response.data;
      const history = responseData?.history || responseData || [];
      set({
        rewardHistory: history,
        isLoading: false,
      });
    } catch (error) {
      handleErrorWithNotification(error, "Failed to load reward history");
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
      handleErrorWithNotification(error, "Failed to update reward");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
