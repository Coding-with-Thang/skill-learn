'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/cms/layout/Sidebar'
import TopBar from '@/components/cms/layout/TopBar'
import { useSidebarStore, useThemeStore } from '@/lib/cms/store'

export default function DashboardLayout({ children }) {
  const { isCollapsed } = useSidebarStore()
  const { theme } = useThemeStore()
  const [marginLeft, setMarginLeft] = useState('0')

  useEffect(() => {
    // Initialize theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    const updateMargin = () => {
      if (window.innerWidth >= 1024) {
        setMarginLeft(isCollapsed ? '80px' : '256px')
      } else {
        setMarginLeft('0')
      }
    }

    updateMargin()
    window.addEventListener('resize', updateMargin)
    return () => window.removeEventListener('resize', updateMargin)
  }, [isCollapsed])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Mobile backdrop */}
      <SidebarBackdrop />

      <div
        className="transition-all duration-300"
        style={{ marginLeft }}
      >
        <TopBar />
        {children}
      </div>
    </div>
  )
}

function SidebarBackdrop() {
  const { isMobileOpen, closeMobileSidebar } = useSidebarStore()
  
  if (!isMobileOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
      onClick={closeMobileSidebar}
      aria-hidden="true"
    />
  )
}
