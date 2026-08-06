"use client";

import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { AppShell } from "@/features/app-shell/components/app-shell";
import { mentorNav } from "@/features/app-shell/nav-config";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth(["MENTOR"]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppShell navItems={mentorNav} notificationsHref="/mentor/announcements">
      {children}
    </AppShell>
  );
}
