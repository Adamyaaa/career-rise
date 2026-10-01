"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import type { Role } from "@/types/user";

export function useRequireAuth(allowedRoles?: Role[]) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(roleHome(user.role));
    }
  }, [isLoading, user, allowedRoles, router]);

  return {
    user,
    ready: !isLoading && !!user && (!allowedRoles || allowedRoles.includes(user.role)),
  };
}

export function roleHome(role: Role): string {
  if (role === "SUPER_ADMIN") return "/admin/users";
  if (role === "MENTOR") return "/mentor/cohorts";
  return "/student/learning";
}
