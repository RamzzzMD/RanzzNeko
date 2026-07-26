"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecentItem, SearchHistoryItem, Post } from "@/types";

const MAX_RECENT = 24;
const MAX_HISTORY = 12;
const MAX_FAVORITES = 200;

interface AppState {
  // Recently viewed
  recent: RecentItem[];
  addRecent: (item: Omit<RecentItem, "viewedAt">) => void;
  clearRecent: () => void;

  // Search history
  history: SearchHistoryItem[];
  addHistory: (query: string) => void;
  removeHistory: (query: string) => void;
  clearHistory: () => void;

  // Favorites / bookmarks
  favorites: Post[];
  toggleFavorite: (post: Post) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      recent: [],
      addRecent: (item) =>
        set((state) => {
          if (!item.id) return state;
          const filtered = state.recent.filter((r) => r.id !== item.id);
          return {
            recent: [{ ...item, viewedAt: Date.now() }, ...filtered].slice(
              0,
              MAX_RECENT
            ),
          };
        }),
      clearRecent: () => set({ recent: [] }),

      history: [],
      addHistory: (query) =>
        set((state) => {
          const q = query.trim();
          if (!q) return state;
          const filtered = state.history.filter(
            (h) => h.query.toLowerCase() !== q.toLowerCase()
          );
          return {
            history: [{ query: q, at: Date.now() }, ...filtered].slice(
              0,
              MAX_HISTORY
            ),
          };
        }),
      removeHistory: (query) =>
        set((state) => ({
          history: state.history.filter((h) => h.query !== query),
        })),
      clearHistory: () => set({ history: [] }),

      favorites: [],
      toggleFavorite: (post) =>
        set((state) => {
          if (!post.id) return state;
          const exists = state.favorites.some((f) => f.id === post.id);
          if (exists) {
            return {
              favorites: state.favorites.filter((f) => f.id !== post.id),
            };
          }
          return {
            favorites: [post, ...state.favorites].slice(0, MAX_FAVORITES),
          };
        }),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "ranzzneko-store",
      partialize: (state) => ({
        recent: state.recent,
        history: state.history,
        favorites: state.favorites,
      }),
    }
  )
);
