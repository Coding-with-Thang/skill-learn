import { create } from "zustand";

/**
 * Flash Card Deck Builder Store
 * Manages deck creation/editing: selected cards, source tracking (owned/shared/already added)
 */
export const useFlashCardDeckBuilderStore = create((set, get) => ({
  selectedCardIds: new Set(),
  deckName: "",
  deckDescription: "",
  mode: "create", // create | edit

  setDeckName: (name) => set({ deckName: name }),
  setDeckDescription: (desc) => set({ deckDescription: desc }),
  setMode: (mode) => set({ mode }),

  toggleCard: (cardId) =>
    set((s) => {
      const next = new Set(s.selectedCardIds);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return { selectedCardIds: next };
    }),

  addCard: (cardId) =>
    set((s) => {
      const next = new Set(s.selectedCardIds);
      next.add(cardId);
      return { selectedCardIds: next };
    }),

  removeCard: (cardId) =>
    set((s) => {
      const next = new Set(s.selectedCardIds);
      next.delete(cardId);
      return { selectedCardIds: next };
    }),

  setSelectedCards: (cardIds) =>
    set({ selectedCardIds: new Set(cardIds) }),

  isSelected: (cardId) => get().selectedCardIds.has(cardId),

  getSelectedIds: () => Array.from(get().selectedCardIds),

  reset: () =>
    set({
      selectedCardIds: new Set(),
      deckName: "",
      deckDescription: "",
      mode: "create",
    }),
}));
