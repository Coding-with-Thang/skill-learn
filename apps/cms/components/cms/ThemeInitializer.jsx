'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/cms/store'

/**
 * Client component to initialize theme from localStorage on mount
 * This ensures theme persists across page reloads
 */
export function ThemeInitializer() {
  useEffect(() => {
    const init = useThemeStore.getState().initializeTheme
    if (typeof init === 'function') init()
  }, [])

  return null
}
