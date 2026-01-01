import { create } from "zustand";
import api from "@/utils/axios";
import { toast } from "sonner";
import { usePointsStore } from "./pointsStore";
import { handleErrorWithNotification } from "@/utils/notifications";
import { createRequestDeduplicator } from "@/utils/requestDeduplication";
import { STORE } from "@/constants";

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

export const useRewardStore = create((set, get) => ({
  rewards: [],
  rewardHistory: [],
  isLoading: false,

  fetchRewards: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchRewards",
      async () => {
        set({ isLoading: true });
        try {
          const response = await api.get("/user/rewards");
          // API returns { success: true, data: { rewards: [...] } }
          const responseData = response.data?.data || response.data;
          const rewards = responseData?.rewards || responseData || [];
          set({
            rewards,
            isLoading: false,
          });
          return rewards;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load rewards");
          set({ isLoading: false });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // New method: Fetch both rewards and history in one call
  fetchRewardsComplete: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchRewardsComplete",
      async () => {
        set({ isLoading: true });
        try {
          const response = await api.get("/user/rewards/complete");
          // API returns { success: true, data: { rewards: [...], history: [...] } }
          const responseData = response.data?.data || response.data;
          const rewards = responseData?.rewards || [];
          const history = responseData?.history || [];
          set({
            rewards,
            rewardHistory: history,
            isLoading: false,
          });
          return { rewards, history };
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load rewards");
          set({ isLoading: false });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
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

      // Use consolidated endpoints: dashboard + rewards complete
      const pointsStore = usePointsStore.getState();
      await Promise.all([
        pointsStore.fetchUserData(true), // Force refresh points after redemption
        get().fetchRewardsComplete(true), // Fetch both rewards and history in one call
      ]);

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to redeem reward");
      throw error; // Re-throw the error to be handled by the component
    }
  },

  fetchRewardHistory: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchRewardHistory",
      async () => {
        set({ isLoading: true });
        try {
          const response = await api.get("/user/rewards/history");
          // API returns { success: true, data: { history: [...] } }
          const responseData = response.data?.data || response.data;
          const history = responseData?.history || responseData || [];
          set({
            rewardHistory: history,
            isLoading: false,
          });
          return history;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load reward history");
          set({ isLoading: false });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
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
