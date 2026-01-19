'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/cms/store'

/**
 * Client component to initialize theme from localStorage on mount
 * This ensures theme persists across page reloads
 */
export function ThemeInitializer() {
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return null
}
