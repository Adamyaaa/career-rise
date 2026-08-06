"use client";

import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { NotificationsDropdown } from "./notifications-dropdown";
import { ProfileDropdown } from "./profile-dropdown";

export function Topbar({
  notificationsHref,
  onOpenMobileNav,
}: {
  notificationsHref: string;
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobileNav} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search…" className="pl-8" />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationsDropdown notificationsHref={notificationsHref} />
        <ProfileDropdown />
      </div>
    </header>
  );
}
