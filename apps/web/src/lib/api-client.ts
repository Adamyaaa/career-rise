import type { ApiErrorBody } from "@career-rise/shared";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(body: ApiErrorBody["error"]) {
    super(body.message);
    this.code = body.code;
    this.details = body.details;
  }
}

let refreshPromise: Promise<boolean> | null = null;

// Access tokens expire after 15 minutes (JWT_ACCESS_TTL) and nothing else in the
// app calls POST /auth/refresh, so without this every session would silently start
// failing requests 15 minutes in. Shares one in-flight refresh across concurrent
// 401s instead of firing a refresh per failed request.
async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken, user } = useAuthStore.getState();
      if (!refreshToken || !user) return false;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const tokens = (await res.json()) as { accessToken: string; refreshToken: string };
        useAuthStore.getState().setSession({ user, ...tokens });
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !isRetry && path !== "/auth/refresh" && path !== "/auth/login") {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, options, true);
    useAuthStore.getState().clearSession();
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    if (body?.error) throw new ApiError(body.error);
    throw new ApiError({ code: "INTERNAL_ERROR", message: `Request failed (${res.status})` });
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Thin wrapper around the real Career Rise API — used only where the backend
// endpoint actually exists (auth, users/me). Everything else goes through the
// mock services in src/services/mock/ until its module is built.
export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
