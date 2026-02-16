import { create } from "zustand";
import api from "../../utils/axios";
import { handleErrorWithNotification } from "../../utils/notifications";
import { createRequestDeduplicator } from "../../utils/requestDeduplication";
import { parseApiResponse, parseApiError } from "../../utils/apiResponseParser";

// STORE constants
const STORE = {
  FETCH_COOLDOWN: 30000, // 30 seconds - features change infrequently
};

// Request deduplication
const requestDeduplicator = createRequestDeduplicator();

/** Store state + actions type so consumers get typed store */
interface FeaturesStore {
  features: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchFeatures: (force?: boolean) => Promise<Record<string, boolean>>;
  isEnabled: (featureKey: string, defaultValue?: boolean) => boolean;
  allEnabled: (featureKeys: string[]) => boolean;
  anyEnabled: (featureKeys: string[]) => boolean;
  refresh: () => Promise<Record<string, boolean>>;
  reset: () => void;
}

/**
 * Features Store
 * Manages feature flags and feature checks
 * Replaces useFeatures hook for better performance and shared state
 */
export const useFeaturesStore = create<FeaturesStore>((set, get) => ({
  // State
  features: {}, // { [featureKey]: boolean }
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Fetch features from API
  fetchFeatures: async (force = false) => {
    return requestDeduplicator.dedupe(
      "fetchFeatures",
      async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get("/features");
          const data = parseApiResponse(response) as { features?: Record<string, boolean> } | null;
          const features = data?.features ?? {};

          set({
            features,
            isLoading: false,
            lastUpdated: Date.now(),
          });

          return features;
        } catch (error: unknown) {
          const err = error as { response?: { data?: { features?: Record<string, boolean> } } };
          const errorMessage = parseApiError(error) || "Failed to fetch features";

          // If error response includes features, use them for graceful degradation
          if (err.response?.data?.features) {
            set({
              features: err.response.data.features,
              isLoading: false,
            });
          } else {
            // Default all features to enabled if there's an error (graceful degradation)
            set({
              features: {},
              isLoading: false,
            });
          }
          set({ error: errorMessage });
          console.error("Error fetching features:", error);
        }
      },
      { force, cooldown: STORE.FETCH_COOLDOWN }
    );
  },

  // Check if a feature is enabled
  isEnabled: (featureKey, defaultValue = true) => {
    const { features, isLoading } = get();

    if (isLoading) {
      return defaultValue; // Return default while loading
    }

    // If feature is not in the list, assume enabled (for backwards compatibility)
    if (!(featureKey in features)) {
      return defaultValue;
    }

    return features[featureKey] === true;
  },

  // Check if multiple features are all enabled
  allEnabled: (featureKeys) => {
    const { isEnabled } = get();
    return featureKeys.every((key) => isEnabled(key));
  },

  // Check if any of the features are enabled
  anyEnabled: (featureKeys) => {
    const { isEnabled } = get();
    return featureKeys.some((key) => isEnabled(key));
  },

  // Refresh features
  refresh: async () => {
    return get().fetchFeatures(true);
  },

  // Reset store
  reset: () =>
    set({
      features: {},
      isLoading: false,
      error: null,
      lastUpdated: null,
    }),
}));

/**
 * Feature keys available in the system
 */
export const FEATURE_KEYS = {
  GAMES: "games",
  COURSE_QUIZZES: "course_quizzes",
  LEADERBOARDS: "leaderboards",
  REWARDS_STORE: "rewards_store",
  ACHIEVEMENTS: "achievements",
  STREAKS: "streaks",
  TRAINING_COURSES: "training_courses",
  POINT_SYSTEM: "point_system",
  CATEGORIES: "categories",
  USER_STATS: "user_stats",
  AUDIT_LOGS: "audit_logs",
  CUSTOM_ROLES: "custom_roles",
  FLASHCARDS: "flash_cards",
};
