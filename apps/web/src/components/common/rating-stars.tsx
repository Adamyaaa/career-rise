import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Read-only 5-star display, derived from a score/maxScore pair (e.g. review criteria
// scored out of 10) — used wherever a quick visual read matters more than the exact number.
export function RatingStars({ score, maxScore, className }: { score: number; maxScore: number; className?: string }) {
  const filled = Math.round((score / maxScore) * 5);
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("size-3.5", i < filled ? "fill-primary text-primary" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}
