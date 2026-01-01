import { create } from 'zustand'

/**
 * Progress Store - Manages user training progress data
 */
export const useProgressStore = create((set, get) => ({
  // State
  currentModule: null,
  isLoading: false,
  error: null,
  stats: {
    completed: 0,
    inProgress: 0,
  },

  // Fetch user's current progress and stats
  fetchProgress: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/user/progress')
      if (!response.ok) throw new Error('Failed to fetch progress')
      
      const data = await response.json()
      set({
        currentModule: data.currentModule || null,
        stats: {
          completed: data.completed || 0,
          inProgress: data.inProgress || 0,
        },
        isLoading: false,
      })
    } catch (error) {
      set({ 
        error: error.message, 
        isLoading: false,
        currentModule: null,
      })
    }
  },

  // Resume training - navigate to current module
  resumeTraining: async (router) => {
    const { currentModule } = get()
    if (!currentModule) return

    try {
      // Navigate to the module/quiz
      if (currentModule.type === 'quiz') {
        router.push(`/quiz/${currentModule.id}`)
      } else {
        router.push(`/categories/${currentModule.categoryId}`)
      }
    } catch (error) {
      set({ error: error.message })
    }
  },

  // Reset store
  reset: () => set({
    currentModule: null,
    isLoading: false,
    error: null,
    stats: { completed: 0, inProgress: 0 },
  }),
}))
