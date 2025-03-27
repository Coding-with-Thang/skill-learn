import { create } from "zustand";
import api from "@/utils/axios";

const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/users");
      set({
        users: response.data.users,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ loading: false });
    }
  },
}));

export default useUsersStore;
