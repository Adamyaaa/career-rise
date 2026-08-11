"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { Topbar } from "@/features/app-shell/components/topbar";
import { Sidebar } from "@/features/app-shell/components/sidebar";
import { mentorNav } from "@/features/app-shell/nav-config";
import { Loader2 } from "lucide-react";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  // Admins sit above mentors and can manage any cohort — the API already allows it via
  // assertCanManageCohort, so this guard would otherwise be the only thing stopping
  // them from posting or deleting announcements, classes and roster entries.
  const { ready } = useRequireAuth(["MENTOR", "SUPER_ADMIN"]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <Topbar navItems={[]} />
      <div className="flex flex-1">
        <Sidebar navItems={mentorNav} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
