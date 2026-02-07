import { create } from "zustand";
import api from "../../utils/axios.js";
import { handleErrorWithNotification } from "../../utils/notifications.js";
import { createRequestDeduplicator } from "../../utils/requestDeduplication.js";
import { parseApiResponse } from "../../utils/apiResponseParser.js";
import { retryWithBackoff } from "../../utils/retry.js";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 60000, // 60 seconds - templates change very infrequently
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

/**
 * Role Templates Store
 * Manages role templates (shared between CMS and LMS)
 */
export const useRoleTemplatesStore = create((set, get) => ({
  // State
  roleTemplates: [],
  templatesBySet: {},
  templateSets: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  retryCount: 0, // Track retry attempts for UI feedback

  // Fetch all role templates
  fetchRoleTemplates: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchRoleTemplates",
      async () => {
        set({ isLoading: true, error: null, retryCount: 0 });
        try {
          const response = await retryWithBackoff(
            () => api.get("/role-templates"),
            {
              maxRetries: 3,
              baseDelay: 1000,
              onRetry: (attempt, error, delay) => {
                set({ retryCount: attempt });
                console.log(`Retrying fetchRoleTemplates (attempt ${attempt}/${3}) after ${delay}ms`);
              },
            }
          );
          const data = parseApiResponse(response);

          set({
            roleTemplates: data.roleTemplates || [],
            templatesBySet: data.groupedBySet || {},
            templateSets: data.templateSets || [],
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return {
            roleTemplates: data.roleTemplates || [],
            templatesBySet: data.groupedBySet || {},
            templateSets: data.templateSets || [],
          };
        } catch (error) {
          handleErrorWithNotification(error, "Failed to load role templates");
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to fetch role templates",
            isLoading: false,
          });
          throw error;
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Create role template
  createRoleTemplate: async (templateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/role-templates", templateData);
      const template = parseApiResponse(response, "roleTemplate") || parseApiResponse(response);

      // Refresh templates
      await get().fetchRoleTemplates(true);

      return template;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to create role template");
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create role template",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update role template
  updateRoleTemplate: async (templateId, templateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/role-templates/${templateId}`, templateData);
      const template = parseApiResponse(response, "roleTemplate") || parseApiResponse(response);

      // Refresh templates
      await get().fetchRoleTemplates(true);

      return template;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to update role template");
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update role template",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete role template
  deleteRoleTemplate: async (templateId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/role-templates/${templateId}`);

      // Refresh templates
      await get().fetchRoleTemplates(true);
    } catch (error) {
      handleErrorWithNotification(error, "Failed to delete role template");
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete role template",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update permissions for role template
  updateTemplatePermissions: async (templateId, permissionId, isChecked) => {
    try {
      const url = `/role-templates/${templateId}/permissions`;
      const response = isChecked
        ? await api.post(url, { permissionIds: [permissionId] })
        : await api.delete(url, { data: { permissionIds: [permissionId] } });

      if (response.data.error) {
        throw new Error(response.data.error || "Failed to update permissions");
      }

      // Refresh templates
      await get().fetchRoleTemplates(true);

      return response.data;
    } catch (error) {
      handleErrorWithNotification(error, "Failed to update permissions");
      throw error;
    }
  },

  // Reset store
  reset: () =>
    set({
      roleTemplates: [],
      templatesBySet: {},
      templateSets: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    }),
}));
