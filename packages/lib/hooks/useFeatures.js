'use client'

import { useEffect } from 'react'
import { useFeaturesStore, FEATURE_KEYS as FEATURE_KEYS_EXPORT } from '../stores/store/featuresStore.js'

/**
 * Hook to check if features are enabled for the current user's tenant
 * 
 * @deprecated Use useFeaturesStore directly for better performance
 * This hook now wraps the Zustand store for backward compatibility
 * 
 * Usage:
 * const { isEnabled, isLoading, features } = useFeatures()
 * 
 * // Check single feature
 * if (isEnabled('games')) { ... }
 * 
 * // Check multiple features
 * const canShowGames = isEnabled('games')
 * const canShowLeaderboard = isEnabled('leaderboards')
 * 
 * // Recommended: Use store directly
 * import { useFeaturesStore } from '@skill-learn/lib/stores/featuresStore';
 * const { isEnabled, isLoading, fetchFeatures } = useFeaturesStore();
 */
export function useFeatures() {
  const store = useFeaturesStore()
  const { features, isLoading, error, isEnabled, allEnabled, anyEnabled, fetchFeatures } = store

  // Fetch features on mount
  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  return {
    features,
    isLoading,
    error,
    isEnabled,
    allEnabled,
    anyEnabled,
    refresh: fetchFeatures,
  }
}

/**
 * Feature keys available in the system
 * Re-exported from featuresStore for backward compatibility
 */
export const FEATURE_KEYS = FEATURE_KEYS_EXPORT

export default useFeatures
