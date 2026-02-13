import { create } from 'zustand'

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('cms-theme')
  return stored === 'dark' || stored === 'light' ? stored : 'light'
}

// Apply theme to document
const applyTheme = (theme) => {
  if (typeof window === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Initialize theme on store creation
const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cms-theme', newTheme)
      applyTheme(newTheme)
    }
    return { theme: newTheme }
  }),
  setTheme: (theme) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cms-theme', theme)
      applyTheme(theme)
    }
    set({ theme })
  },
  // Initialize theme on mount (for SSR compatibility)
  initializeTheme: () => {
    const stored = getInitialTheme()
    applyTheme(stored)
    set({ theme: stored })
  },
}))

export const useSidebarStore = create((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setSidebarCollapsed: (isCollapsed) => set({ isCollapsed }),
  toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileSidebarOpen: (isOpen) => set({ isMobileOpen: isOpen }),
  closeMobileSidebar: () => set({ isMobileOpen: false }),
}))

export const useDashboardStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  selectedTimeRange: '30D',
  setTimeRange: (range) => set({ selectedTimeRange: range }),
  
  tenantFilter: 'all',
  setTenantFilter: (filter) => set({ tenantFilter: filter }),
  
  notifications: [
    { id: 1, title: 'New tenant signup', message: 'Acme University joined', time: new Date(), read: false },
    { id: 2, title: 'Payment received', message: '$2,499 from TechEd Corp', time: new Date(Date.now() - 3600000), read: false },
    { id: 3, title: 'System alert', message: 'High disk usage detected', time: new Date(Date.now() - 7200000), read: true },
  ],
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
}))
