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
      // API returns { success: true, data: { users: [...] } }
      const responseData = response.data?.data || response.data;
      const users = responseData?.users || responseData || [];
      set({
        users,
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
      // API returns { success: true, data: { user: {...} } }
      const responseData = response.data?.data || response.data;
      const newUser = responseData?.user || responseData;
      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));
      return newUser;
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
      // API returns { success: true, data: { user: {...} } }
      const responseData = response.data?.data || response.data;
      const updatedUser = responseData?.user || responseData;
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? updatedUser : user
        ),
        isLoading: false,
      }));
      return updatedUser;
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
