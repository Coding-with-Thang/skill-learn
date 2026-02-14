import { create } from 'zustand'

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('lms-theme')
    return stored === 'dark' || stored === 'light' ? stored : 'light'
}

// Apply theme to document
const applyTheme = (theme: 'light' | 'dark') => {
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

type ThemeState = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  initializeTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initialTheme,
    toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    // Save to localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('lms-theme', newTheme)
        applyTheme(newTheme)
    }
    return { theme: newTheme }
    }),
    setTheme: (theme) => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('lms-theme', theme)
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
