import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/user";

// Backed by the real Career Rise API — GET/PATCH /users/me (Phase 4).
export const usersService = {
  getMe: () => apiClient.get<User>("/users/me"),
  updateMe: (input: { email?: string; firstName?: string; lastName?: string; phone?: string }) =>
    apiClient.patch<User>("/users/me", input),
};
