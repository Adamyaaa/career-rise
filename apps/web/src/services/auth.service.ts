import type { User } from "@/types/user";

export interface AuthResponse {
  user: User;
}

export const authService = {
  register: async (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Registration failed");
    return data as AuthResponse;
  },

  login: async (input: { email: string; password: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Login failed");
    return data as AuthResponse;
  },

  logout: async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) throw new Error("Logout failed");
    return { success: true };
  },

  sendOtp: async (email: string) => {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Failed to send OTP");
    return data as { success: true; delivered: boolean; otp?: string };
  },

  loginOtp: async (email: string, code: string) => {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Invalid OTP code");
    return data as AuthResponse;
  },

  me: async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return { user: null };
    return res.json() as Promise<{ user: User | null }>;
  },
};
