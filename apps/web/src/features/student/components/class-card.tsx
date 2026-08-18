"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Presentation,
  Upload,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LessonProgress } from "@/services/learning.service";

export function ClassCard({ lesson, index, href }: { lesson: LessonProgress; index: number; href: string }) {
  // `completed` is true when feedback is provided. `taught` is true when time has passed.
  const { completed, cancelled, taught } = lesson;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 transition-shadow hover:shadow-md",
        cancelled ? "opacity-70 ring-destructive/25" : completed ? "ring-primary/25" : "ring-foreground/10",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex w-fit items-center gap-1 text-[11px] font-medium uppercase tracking-wider",
            cancelled
              ? "text-destructive"
              : completed
                ? "text-primary"
                : "text-muted-foreground",
          )}
        >
          {cancelled ? (
            <>
              <XCircle className="size-3.5" />
              Cancelled
            </>
          ) : completed ? (
            <>
              <CheckCircle2 className="size-3.5" />
              Completed
            </>
          ) : (
            <>
              <Circle className="size-3.5" />
              Upcoming
            </>
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Class {index + 1}
            </span>
            {cancelled && (
              <Badge variant="outline" className="border-destructive/40 text-[10px] text-destructive">
                Cancelled
              </Badge>
            )}
            {lesson.submissionRequired && (
              <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
                Submission required
              </Badge>
            )}
            {!lesson.scheduledAt && (
              <Badge variant="outline" className="text-[10px]">
                Not scheduled
              </Badge>
            )}
          </div>

          <p
            className={cn(
              "font-heading text-base leading-snug font-medium",
              cancelled && "line-through",
              completed ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {lesson.title}
          </p>

          {lesson.scheduledAt && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" />
                {formatDate(lesson.scheduledAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" />
                {formatTime(lesson.scheduledAt)}
              </span>
            </p>
          )}
        </div>

        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      {/* What's waiting inside, so the card still signals it without being clickable
          itself — the whole card is one link. */}
      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border/60 pt-3 text-xs">
        <span className={cn("flex items-center gap-1.5", lesson.slidesUrl ? "text-primary" : "text-muted-foreground/50")}>
          <Presentation className="size-3.5" />
          Slides
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5",
            lesson.assignmentsUrl ? "text-primary" : "text-muted-foreground/50",
          )}
        >
          <FileText className="size-3.5" />
          Assignments
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5",
            lesson.submissionRequired ? "text-primary" : "text-muted-foreground/50",
          )}
        >
          <Upload className="size-3.5" />
          Submit
        </span>
      </div>
    </Link>
  );
}
