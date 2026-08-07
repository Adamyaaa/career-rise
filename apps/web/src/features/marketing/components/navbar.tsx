"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/common/logo";
import { marketingNavLinks } from "@/constants/site";
import { useAuthStore } from "@/stores/auth-store";
import { useMounted } from "@/hooks/use-mounted";
import { roleHome } from "@/hooks/use-require-auth";
import { ProfileDropdown } from "@/features/app-shell/components/profile-dropdown";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);
  // Only trust the persisted session once mounted — see the note on useAuthStore
  // about SSR/first-paint reading the un-rehydrated (null) state.
  const loggedIn = mounted && !!user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {marketingNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <>
              <Button variant="ghost" render={<Link href={roleHome(user!.role)} />}>
                Dashboard
              </Button>
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button render={<Link href="/register" />}>Get started</Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {marketingNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                {loggedIn ? (
                  <Button
                    render={<Link href={roleHome(user!.role)} onClick={() => setMobileOpen(false)} />}
                  >
                    Go to dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      render={<Link href="/login" onClick={() => setMobileOpen(false)} />}
                    >
                      Log in
                    </Button>
                    <Button render={<Link href="/register" onClick={() => setMobileOpen(false)} />}>
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
