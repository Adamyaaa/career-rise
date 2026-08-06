import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: Session) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

// Persisted to localStorage, so any component reading this store during SSR/first
// paint sees the un-rehydrated default (all null) — consumers that redirect based on
// auth state must gate on a client-mounted flag first (see useRequireAuth).
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "career-rise-auth" },
  ),
);
