import { create } from "zustand";
export const useQuizStore = create((set) => ({
  config: {
    id: "",
    numberOfQuestions: 10,
    category: {
      id: 0,
      name: "",
    },
    status: "",
    score: 0,
  },
  addId: (count) =>
    set((state) => ({ config: { ...state.config, id: count } })),
  addNumberOfQuestions: (count) =>
    set((state) => ({ config: { ...state.config, numberOfQuestions: count } })),
  addCategory: (id, name) =>
    set((state) => ({ config: { ...state.config, category: { id, name } } })),
  changeStatus: (status) =>
    set((state) => ({ config: { ...state.config, status } })),
  setScore: (score) => set((state) => ({ config: { ...state.config, score } })),
}));

export const useQuizStartStore = create((set) => ({
  config: {
    selectedQuiz: null,
    quizResponses: [],
  },
  setSelectedQuiz: (quiz) => set({ selectedQuiz: quiz }),
  setQuizResponses: (newResponses) => set({ quizResponses: newResponses }),
}));
