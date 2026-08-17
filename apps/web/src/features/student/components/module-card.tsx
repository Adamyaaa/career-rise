"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, CheckCircle2, ChevronRight, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ModuleProgress } from "@/services/learning.service";

export function ModuleCard({
  module,
  index,
  href,
}: {
  module: ModuleProgress;
  index: number;
  href: string;
}) {
  // A module has no date of its own — its span comes from the classes inside it.
  const dates = module.lessons
    .map((l) => l.scheduledAt)
    .filter((d): d is string => d !== null)
    .sort();
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const isComplete = module.percent >= 100;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 transition-shadow hover:shadow-md",
        isComplete ? "ring-primary/25" : "ring-foreground/10",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
            isComplete ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {isComplete ? <CheckCircle2 className="size-4" /> : <Layers className="size-4" />}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Module {index + 1}
            </span>
            {isComplete && (
              <Badge variant="secondary" className="text-[10px]">
                Complete
              </Badge>
            )}
          </div>

          <p className="font-heading text-base leading-snug font-medium text-foreground">{module.title}</p>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 shrink-0" />
              {module.totalLessons} {module.totalLessons === 1 ? "class" : "classes"}
            </span>
            {firstDate && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" />
                {formatDate(firstDate)}
                {lastDate && lastDate !== firstDate && ` – ${formatDate(lastDate)}`}
              </span>
            )}
          </p>
        </div>

        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-auto flex flex-col gap-1.5 border-t border-border/60 pt-3">
        <Progress value={module.percent} />
        <p className="text-xs text-muted-foreground">
          {module.completedLessons} of {module.totalLessons} done · {module.percent}%
        </p>
      </div>
    </Link>
  );
}
