"use client";

import { useAuth } from "@/providers/auth-provider";
import type { User } from "@/types/user";

interface AuthStateCompat {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: { user: User }) => void;
  setUser: (user: User | null) => void;
  clearSession: () => void;
}

export function useAuthStore<T = AuthStateCompat>(
  selector?: (state: AuthStateCompat) => T,
): T {
  const auth = useAuth();

  const state: AuthStateCompat = {
    user: auth.user,
    accessToken: null,
    refreshToken: null,
    setSession: auth.setSession,
    setUser: auth.setUser,
    clearSession: auth.logout,
  };

  return selector ? selector(state) : (state as unknown as T);
}
