"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearnCompletionBarProps {
  trackSlug: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  prevLesson?: { slug: string; title: string };
  nextLesson?: { slug: string; title: string };
}

export function LearnCompletionBar({
  trackSlug,
  isCompleted,
  onToggleComplete,
  prevLesson,
  nextLesson,
}: LearnCompletionBarProps) {
  return (
    <div className="flex flex-col gap-6 pt-8 mt-12 border-t border-border/70">
      {/* Mark as complete button */}
      <div className="flex items-center">
        <button
          onClick={onToggleComplete}
          className={cn(
            "group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-xs cursor-pointer",
            isCompleted
              ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/60",
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="size-4 text-primary fill-primary/20" />
          ) : (
            <Circle className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          <span>{isCompleted ? "Completed" : "Mark as complete"}</span>
        </button>
      </div>

      {/* Prev / Next Pagination Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {prevLesson ? (
          <Link
            href={`/student/learn/${trackSlug}/${prevLesson.slug}`}
            className="group flex flex-col gap-1 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-primary/40 text-left"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase group-hover:text-primary transition-colors">
              <ArrowLeft className="size-3.5" />
              Previous
            </span>
            <span className="font-heading text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {prevLesson.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson && (
          <Link
            href={`/student/learn/${trackSlug}/${nextLesson.slug}`}
            className="group flex flex-col items-end gap-1 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:ring-primary/40 text-right sm:col-start-2"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase group-hover:text-primary transition-colors">
              Next
              <ArrowRight className="size-3.5" />
            </span>
            <span className="font-heading text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {nextLesson.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
