import { create } from "zustand";

const defaultQuizConfig = {
  id: "",
  numberOfQuestions: 10,
  category: {
    id: 0,
    name: "",
  },
  status: "",
  score: 0,
};

const defaultQuizStartConfig = {
  questionCount: 1,
  category: null,
  selectedQuiz: null,
  quizResponses: [],
};
export const useQuizStore = create((set) => ({
  config: { ...defaultQuizConfig },
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
  config: { ...defaultQuizStartConfig },
  setQuestionCount: (count) =>
    set((state) => ({ config: { ...state.config, questionCount: count } })),
  setCategory: (id, name) =>
    set((state) => ({ config: { ...state.config, category: { id, name } } })),
  setSelectedQuiz: (quiz) => set({ selectedQuiz: quiz }),
  setQuizResponses: (newResponses) => set({ quizResponses: newResponses }),
}));
