import { create } from "zustand";
import axios from "axios";

const usePointsStore = create((set) => ({
  pointStatus: null,
  loading: false,
  earning: false,

  fetchStatus: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/points");
      console.log("Response", response.data);
      set({ pointStatus: response.data });
    } catch (error) {
      console.error(
        "Error fetching point status:",
        error.response?.data?.error || error.message
      );
    } finally {
      set({ loading: false });
    }
  },

  earnPoints: async (amount, reason) => {
    set({ earning: true });
    try {
      const response = await axios.post("/api/points", {
        amount,
        reason,
      });

      // Refresh point status
      const statusResponse = await axios.get("/api/points");
      set({ pointStatus: statusResponse.data });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Network error",
      };
    } finally {
      set({ earning: false });
    }
  },

  reset: () => {
    set({ pointStatus: null, loading: false, earning: false });
  },
}));

export default usePointsStore;
