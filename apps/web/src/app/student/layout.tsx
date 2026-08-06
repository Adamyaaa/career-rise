"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { studentNav } from "@/features/app-shell/nav-config";
import { Loader2 } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth(["STUDENT"]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppShell navItems={studentNav} notificationsHref="/student/notifications">
      {children}
    </AppShell>
  );
}
