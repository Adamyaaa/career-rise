"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types/user";
import { useMounted } from "./use-mounted";

// Client-side "optimistic" route protection: redirects to /login if there's no
// session, or to the caller's own dashboard if the role doesn't match. This is a
// prototype-level guard, not a security boundary — every real API call is still
// authorized server-side by the backend's JwtAuthGuard/RolesGuard regardless.
export function useRequireAuth(allowedRoles?: Role[]) {
  const mounted = useMounted();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(roleHome(user.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user]);

  return { user, ready: mounted && !!user };
}

export function roleHome(role: Role): string {
  if (role === "SUPER_ADMIN") return "/admin/users";
  if (role === "MENTOR") return "/mentor/cohorts";
  return "/student/learning";
}
