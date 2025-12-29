import { create } from "zustand";
import api from "@/utils/axios";

export const useUsersStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/users");
      set({
        users: response.data.users,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch users",
        isLoading: false
      });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/users", userData);
      set((state) => ({
        users: [response.data, ...state.users],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      set({
        error: error.response?.data?.error || "Failed to create user",
        isLoading: false
      });
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/users/${userId}`, userData);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? response.data : user
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      set({
        error: error.response?.data?.error || "Failed to update user",
        isLoading: false
      });
      throw error;
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/users/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
      set({
        error: error.response?.data?.error || "Failed to delete user",
        isLoading: false
      });
      throw error;
    }
  },
}));
