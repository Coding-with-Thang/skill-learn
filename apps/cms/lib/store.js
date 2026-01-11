import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
    return { theme: newTheme }
  }),
  setTheme: (theme) => set({ theme }),
}))

export const useSidebarStore = create((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setSidebarCollapsed: (isCollapsed) => set({ isCollapsed }),
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
