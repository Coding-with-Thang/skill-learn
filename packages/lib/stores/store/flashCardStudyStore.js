import { create } from "zustand";

/**
 * Flash Card Study Session Store
 * Holds current study session state: cards, index, flipped, feedback pending
 */
export const useFlashCardStudyStore = create((set, get) => ({
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  isSubmitting: false,
  totalDue: 0,
  totalNew: 0,

  setCards: (cards, totalDue = 0, totalNew = 0) =>
    set({
      cards,
      currentIndex: 0,
      isFlipped: false,
      totalDue,
      totalNew,
    }),

  nextCard: () =>
    set((s) => ({
      currentIndex: Math.min(s.currentIndex + 1, s.cards.length - 1),
      isFlipped: false,
    })),

  prevCard: () =>
    set((s) => ({
      currentIndex: Math.max(s.currentIndex - 1, 0),
      isFlipped: false,
    })),

  flip: () => set((s) => ({ isFlipped: !s.isFlipped })),

  setSubmitting: (v) => set({ isSubmitting: v }),

  getCurrentCard: () => {
    const { cards, currentIndex } = get();
    return cards[currentIndex] ?? null;
  },

  hasNext: () => {
    const { cards, currentIndex } = get();
    return currentIndex < cards.length - 1;
  },

  hasPrev: () => {
    const { currentIndex } = get();
    return currentIndex > 0;
  },

  removeCurrentCard: () =>
    set((s) => {
      if (s.cards.length === 0) return s;
      const next = s.cards.filter((_, i) => i !== s.currentIndex);
      const newIndex =
        s.currentIndex >= next.length
          ? Math.max(0, next.length - 1)
          : s.currentIndex;
      return {
        cards: next,
        currentIndex: newIndex,
        isFlipped: false,
      };
    }),

  reset: () =>
    set({
      cards: [],
      currentIndex: 0,
      isFlipped: false,
      isSubmitting: false,
      totalDue: 0,
      totalNew: 0,
    }),
}));
