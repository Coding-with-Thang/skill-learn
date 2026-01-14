'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to check if features are enabled for the current user's tenant
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
 */
export function useFeatures() {
  const [features, setFeatures] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeatures = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/features')
      
      if (!response.ok) {
        throw new Error('Failed to fetch features')
      }
      
      const data = await response.json()
      setFeatures(data.features || {})
    } catch (err) {
      console.error('Error fetching features:', err)
      setError(err.message)
      // Default all features to enabled if there's an error
      setFeatures({})
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  /**
   * Check if a feature is enabled
   * @param {string} featureKey - The feature key to check
   * @param {boolean} defaultValue - Default value if feature is not found (defaults to true)
   * @returns {boolean} - Whether the feature is enabled
   */
  const isEnabled = useCallback((featureKey, defaultValue = true) => {
    if (isLoading) {
      return defaultValue // Return default while loading
    }
    
    // If feature is not in the list, assume enabled (for backwards compatibility)
    if (!(featureKey in features)) {
      return defaultValue
    }
    
    return features[featureKey]
  }, [features, isLoading])

  /**
   * Check if multiple features are all enabled
   * @param {string[]} featureKeys - Array of feature keys to check
   * @returns {boolean} - Whether all features are enabled
   */
  const allEnabled = useCallback((featureKeys) => {
    return featureKeys.every(key => isEnabled(key))
  }, [isEnabled])

  /**
   * Check if any of the features are enabled
   * @param {string[]} featureKeys - Array of feature keys to check
   * @returns {boolean} - Whether any feature is enabled
   */
  const anyEnabled = useCallback((featureKeys) => {
    return featureKeys.some(key => isEnabled(key))
  }, [isEnabled])

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
 */
export const FEATURE_KEYS = {
  GAMES: 'games',
  COURSE_QUIZZES: 'course_quizzes',
  LEADERBOARDS: 'leaderboards',
  REWARDS_STORE: 'rewards_store',
  ACHIEVEMENTS: 'achievements',
  STREAKS: 'streaks',
  TRAINING_COURSES: 'training_courses',
  POINT_SYSTEM: 'point_system',
  CATEGORIES: 'categories',
  USER_STATS: 'user_stats',
  AUDIT_LOGS: 'audit_logs',
  CUSTOM_ROLES: 'custom_roles',
}

export default useFeatures
