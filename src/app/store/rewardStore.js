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
}));
