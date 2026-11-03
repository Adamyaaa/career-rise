"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";
import { Topbar } from "@/features/app-shell/components/topbar";
import { Sidebar } from "@/features/app-shell/components/sidebar";
import { studentNav } from "@/features/app-shell/nav-config";
import { AskMentorSheet } from "@/features/mentor-chat/components/ask-mentor-sheet";
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
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar navItems={studentNav} />
      <div className="flex flex-1 min-w-0">
        <Sidebar navItems={studentNav} />
        <main className="mx-auto w-full min-w-0 flex-1 px-3 py-5 sm:px-6 lg:px-8 max-w-[1600px]">{children}</main>
        <AskMentorSheet />
      </div>
    </div>
  );
}
