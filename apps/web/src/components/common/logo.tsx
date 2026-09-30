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
          width={165}
          height={45}
          className="h-9 sm:h-9.5 md:h-10 w-auto object-contain"
          priority
        />
      ) : (
        <div className="relative flex size-9 shrink-0 items-center justify-center">
          <Image
            src="/logo-icon.png"
            alt="Career Rise"
            width={36}
            height={36}
            className="size-9 object-contain"
            priority
          />
        </div>
      )}
    </Link>
  );
}
