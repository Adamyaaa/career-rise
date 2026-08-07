"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { Topbar } from "@/features/app-shell/components/topbar";
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
    <div className="flex min-h-full flex-col">
      <Topbar navItems={studentNav} />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
