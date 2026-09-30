import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  variant = "full",
}: {
  className?: string;
  showText?: boolean;
  variant?: "full" | "icon";
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline-hidden",
        className,
      )}
    >
      {variant === "full" && showText ? (
        <Image
          src="/logo-full.png"
          alt="Career Rise"
          width={150}
          height={40}
          className="h-8 sm:h-8.5 w-auto object-contain"
          priority
        />
      ) : (
        <div className="relative flex size-8 shrink-0 items-center justify-center">
          <Image
            src="/logo-icon.png"
            alt="Career Rise"
            width={32}
            height={32}
            className="size-8 object-contain"
            priority
          />
        </div>
      )}
    </Link>
  );
}
