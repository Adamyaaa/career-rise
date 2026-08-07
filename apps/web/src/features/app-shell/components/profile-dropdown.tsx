"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";

function initialsFor(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function ProfileDropdown() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);

  if (!user) return null;

  async function handleLogout() {
    if (refreshToken) await authService.logout(refreshToken).catch(() => {});
    clearSession();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger nativeButton render={<Button variant="ghost" size="icon" className="rounded-full" />}>
        <Avatar>
          <AvatarFallback>{initialsFor(user.email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="text-sm font-medium text-foreground">{user.email}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {user.role.toLowerCase().replace("_", " ")}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "STUDENT" && (
          <DropdownMenuItem render={<Link href="/student/profile" />}>
            <User />
            Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
