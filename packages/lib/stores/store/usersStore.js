import { create } from "zustand";
import api from "../../utils/axios.js";
import { handleErrorWithNotification } from "../../utils/notifications.js";
import { createRequestDeduplicator } from "../../utils/requestDeduplication.js";
import { parseApiResponse } from "../../utils/apiResponseParser.js";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 5000, // 5 seconds
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

export const useUsersStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchUsers",
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/users");
          // API returns standardized format: { success: true, data: { users: [...] } }
          const users = parseApiResponse(response, "users") || [];
          set({
            users,
            isLoading: false,
          });
          return users;
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load users");
          set({
            error: error.response?.data?.error || "Failed to fetch users",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/users", userData);
      // API returns standardized format: { success: true, data: { user: {...} } }
      const newUser =
        parseApiResponse(response, "user") || parseApiResponse(response);
      set((state) => ({
        users: [newUser, ...state.users],
        isLoading: false,
      }));
      return newUser;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to create user");
      set({
        error: error.response?.data?.error || "Failed to create user",
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/users/${userId}`, userData);
      // API returns standardized format: { success: true, data: { user: {...} } }
      const updatedUser =
        parseApiResponse(response, "user") || parseApiResponse(response);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? updatedUser : user
        ),
        isLoading: false,
      }));
      return updatedUser;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to update user");
      set({
        error: error.response?.data?.error || "Failed to update user",
        isLoading: false,
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
      handleErrorWithNotification(error, "Failed to delete user");
      set({
        error: error.response?.data?.error || "Failed to delete user",
        isLoading: false,
      });
      throw error;
    }
  },
}));
