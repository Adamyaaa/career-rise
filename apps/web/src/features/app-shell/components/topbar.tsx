"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "./profile-dropdown";
import type { NavItem } from "../nav-config";

export function Topbar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/60 bg-background px-4 sm:px-6">
      <Logo />

      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <ProfileDropdown />
      </div>
    </header>
  );
}
