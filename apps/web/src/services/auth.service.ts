import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/user";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

type AuthResponse = TokenPair & { user: User };

// Backed by the real Career Rise API (apps/api) — see Phase 4: /auth/register,
// /auth/login, /auth/refresh, /auth/logout are all implemented.
export const authService = {
  register: (input: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    apiClient.post<AuthResponse>("/auth/register", input),

  login: (input: { email: string; password: string }) =>
    apiClient.post<AuthResponse>("/auth/login", input),

  refresh: (refreshToken: string) =>
    apiClient.post<TokenPair>("/auth/refresh", { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<{ success: true }>("/auth/logout", { refreshToken }),

  // `otp` is only present on a dev machine with no mail provider configured; when
  // `delivered` is true the code went out by email and is never returned here.
  sendOtp: (email: string) =>
    apiClient.post<{ success: true; delivered: boolean; otp?: string }>("/auth/otp/send", { email }),

  loginOtp: (email: string, code: string) =>
    apiClient.post<AuthResponse>("/auth/otp/verify", { email, code }),
};
