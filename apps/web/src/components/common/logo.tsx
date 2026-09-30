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
      <div className="relative flex size-7 shrink-0 items-center justify-center">
        <Image
          src="/logo-icon.png"
          alt="Career Rise"
          width={28}
          height={28}
          className="size-7 object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-heading text-base font-medium tracking-tight text-foreground">
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
