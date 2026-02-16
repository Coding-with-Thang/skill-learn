import { create } from "zustand";

interface FlashCardStudyStore {
  cards: unknown[];
  currentIndex: number;
  isFlipped: boolean;
  isSubmitting: boolean;
  totalDue: number;
  totalNew: number;
  setCards: (cards: unknown[], totalDue?: number, totalNew?: number) => void;
  nextCard: () => void;
  loopToStart: () => void;
  shuffleCards: () => void;
  prevCard: () => void;
  flip: () => void;
  setSubmitting: (v: boolean) => void;
  getCurrentCard: () => unknown | null;
  hasNext: () => boolean;
  hasPrev: () => boolean;
  removeCurrentCard: () => void;
  reset: () => void;
}

/**
 * Flash Card Study Session Store
 * Holds current study session state: cards, index, flipped, feedback pending
 */
export const useFlashCardStudyStore = create<FlashCardStudyStore>((set, get) => ({
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

  loopToStart: () =>
    set({ currentIndex: 0, isFlipped: false }),

  shuffleCards: () =>
    set((s) => {
      if (s.cards.length < 2) return s;
      const shuffled = [...s.cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { cards: shuffled, currentIndex: 0, isFlipped: false };
    }),

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
