'use client'

import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { useSidebarStore, useThemeStore } from '@/lib/store'

export default function DashboardLayout({ children }) {
  const { isCollapsed } = useSidebarStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // Initialize theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div
        className="transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '256px' }}
      >
        <TopBar />
        {children}
      </div>
    </div>
  )
}
