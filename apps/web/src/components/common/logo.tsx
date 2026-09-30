import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 text-sm font-semibold tracking-tight transition-opacity hover:opacity-90",
        className,
      )}
    >
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        <Image
          src="/logo-icon.png"
          alt="Career Rise Logo"
          width={32}
          height={32}
          className="size-8 object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-heading text-base font-semibold tracking-tight text-foreground">
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
