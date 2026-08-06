"use client";

import { useState, type ReactNode } from "react";
import { Logo } from "@/components/common/logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";
import type { NavItem } from "../nav-config";

export function AppShell({
  navItems,
  notificationsHref,
  children,
}: {
  navItems: NavItem[];
  notificationsHref: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 md:flex">
        <div className="flex h-14 items-center border-b border-border/60 px-4">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav items={navItems} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-14 justify-center border-b border-border/60 p-4">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar notificationsHref={notificationsHref} onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
