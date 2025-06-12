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
      set({
        error: error.response?.data?.error || "Failed to fetch users",
        loading: false
      });
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/users", userData);
      set((state) => ({
        users: [response.data, ...state.users],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      set({
        error: error.response?.data?.error || "Failed to create user",
        loading: false
      });
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/users/${userId}`, userData);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? response.data : user
        ),
        loading: false,
      }));
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      set({
        error: error.response?.data?.error || "Failed to update user",
        loading: false
      });
      throw error;
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/users/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        loading: false,
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
      set({
        error: error.response?.data?.error || "Failed to delete user",
        loading: false
      });
      throw error;
    }
  },
}));

export default useUsersStore;
