"use client";

import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { adminNav } from "@/features/app-shell/nav-config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth(["SUPER_ADMIN"]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppShell navItems={adminNav} notificationsHref="/admin/settings">
      {children}
    </AppShell>
  );
}
