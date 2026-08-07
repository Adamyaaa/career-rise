import Link from "next/link";
import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-sm font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkle className="size-4" strokeWidth={2.25} />
      </span>
      <span className="font-heading text-base font-medium">{siteConfig.name}</span>
    </Link>
  );
}
