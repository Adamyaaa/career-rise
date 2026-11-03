"use client";

import { create } from "zustand";
import type { ResourceNote, ResourceCategoryId } from "../types/resource.types";
import { DEFAULT_TECHNICAL_NOTES } from "../data/resources-data";

const CUSTOM_NOTES_STORAGE_KEY = "career_rise_custom_resources_notes";

interface ResourcesState {
  isOpen: boolean;
  activeNoteId: string | null;
  activeCategoryId: string;
  searchQuery: string;
  isMaximized: boolean;
  notes: ResourceNote[];

  // Actions
  open: (noteId?: string, categoryId?: string) => void;
  close: () => void;
  toggle: () => void;
  setActiveNoteId: (id: string | null) => void;
  setActiveCategoryId: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleMaximized: () => void;
  addCustomNote: (note: Omit<ResourceNote, "id" | "customAdded">) => void;
  removeCustomNote: (id: string) => void;
  loadStoredNotes: () => void;
}

export const useResourcesStore = create<ResourcesState>((set, get) => ({
  isOpen: false,
  activeNoteId: null,
  activeCategoryId: "all",
  searchQuery: "",
  isMaximized: false,
  notes: DEFAULT_TECHNICAL_NOTES,

  open: (noteId, categoryId) => {
    get().loadStoredNotes();
    set({
      isOpen: true,
      activeNoteId: noteId !== undefined ? noteId : get().activeNoteId,
      activeCategoryId: categoryId !== undefined ? categoryId : get().activeCategoryId,
    });
  },

  close: () => set({ isOpen: false }),

  toggle: () => {
    const willOpen = !get().isOpen;
    if (willOpen) {
      get().loadStoredNotes();
    }
    set({ isOpen: willOpen });
  },

  setActiveNoteId: (id) => set({ activeNoteId: id }),

  setActiveCategoryId: (categoryId) => set({ activeCategoryId: categoryId }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleMaximized: () => set((state) => ({ isMaximized: !state.isMaximized })),

  loadStoredNotes: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(CUSTOM_NOTES_STORAGE_KEY);
      if (raw) {
        const custom: ResourceNote[] = JSON.parse(raw);
        set({ notes: [...custom, ...DEFAULT_TECHNICAL_NOTES] });
      }
    } catch {
      // Ignore parsing errors
    }
  },

  addCustomNote: (newNoteData) => {
    const newNote: ResourceNote = {
      ...newNoteData,
      id: `custom-note-${Date.now()}`,
      customAdded: true,
    };
    const updated = [newNote, ...get().notes];
    set({ notes: updated, activeNoteId: newNote.id });

    if (typeof window !== "undefined") {
      try {
        const customOnly = updated.filter((n) => n.customAdded);
        localStorage.setItem(CUSTOM_NOTES_STORAGE_KEY, JSON.stringify(customOnly));
      } catch {
        // Ignore storage errors
      }
    }
  },

  removeCustomNote: (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    set({
      notes: updated,
      activeNoteId: get().activeNoteId === id ? null : get().activeNoteId,
    });

    if (typeof window !== "undefined") {
      try {
        const customOnly = updated.filter((n) => n.customAdded);
        localStorage.setItem(CUSTOM_NOTES_STORAGE_KEY, JSON.stringify(customOnly));
      } catch {
        // Ignore storage errors
      }
    }
  },
}));
