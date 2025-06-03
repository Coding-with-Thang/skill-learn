import { create } from "zustand";
import api from "@/utils/axios";
import { toast } from "sonner";

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
      set({ isLoading: true });
      const response = await api.post("/user/rewards/redeem", { rewardId });

      toast.success(response.data.message);

      // Update points in the points store
      const pointsStore = usePointsStore.getState();
      pointsStore.fetchPoints(); // Refresh points after redemption

      return true;
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error(error.response?.data?.error || "Failed to redeem reward");
      return false;
    } finally {
      set({ isLoading: false });
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
