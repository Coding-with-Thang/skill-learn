import { create } from 'zustand'

const defaultQuizConfig = {
  id: "",
  numberOfQuestions: 10,
  category: {
    id: 0,
    name: ""
  },
  status: "",
  score: 0
}
export const useQuizStore = create((set) => ({
  config: { ...defaultQuizConfig },
  addId: (count) => set((state) => ({ config: { ...state.config, id: count } })),
  addNumberOfQuestions: (count) => set((state) => ({ config: { ...state.config, numberOfQuestions: count } })),
  addCategory: (id, name) => set((state) => ({ config: { ...state.config, category: { id, name } } })),
  addStatus: (status) => set((state) => ({ config: { ...state.config, status } })),
  addScore: (score) => set((state) => ({ config: { ...state.config, score } }))
}))