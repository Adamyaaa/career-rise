"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "./profile-dropdown";
import type { NavItem } from "../nav-config";

export function Topbar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        {navItems.length > 0 && (
          <div className="flex md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                nativeButton
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <Menu className="size-4.5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <SheetHeader className="p-4 border-b border-border/60">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
                    Menu
                  </div>
                  {navItems.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="size-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-border/60 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Account</span>
                    <ProfileDropdown />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        <Logo />
      </div>

      <div className="flex items-center gap-2">
        <ProfileDropdown />
      </div>
    </header>
  );
}
