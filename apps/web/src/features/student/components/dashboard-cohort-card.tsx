"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, Calendar, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { MyCohortSummary } from "@/services/learning.service";
import { cn } from "@/lib/utils";

function getTopicMeta(title: string) {
  const t = title.toLowerCase();
  if (t.includes("agent") || t.includes("ai") || t.includes("llm") || t.includes("genai")) {
    return {
      icon: Sparkles,
      iconContainer: "bg-[#EEF4FF] text-primary border border-blue-100/60 shadow-2xs",
      fallbackDescription: "AI agents, tools and real-world applications.",
    };
  }
  if (t.includes("product") || t.includes("management") || t.includes("pm")) {
    return {
      icon: Briefcase,
      iconContainer: "bg-[#F5F0FF] text-[#7C3AED] border border-purple-100/60 shadow-2xs",
      fallbackDescription: "Build, strategize and ship products.",
    };
  }
  return {
    icon: Layers,
    iconContainer: "bg-[#EEF4FF] text-primary border border-blue-100/60 shadow-2xs",
    fallbackDescription: "Structured curriculum and hands-on portfolio projects.",
  };
}

export function DashboardCohortCard({
  cohort,
  hrefBase = "/student/learning",
}: {
  cohort: MyCohortSummary;
  hrefBase?: string;
}) {
  const meta = getTopicMeta(cohort.course.title || cohort.name);
  const IconComponent = meta.icon;

  const totalLessons = cohort.progress?.totalLessons ?? 0;
  const percent = cohort.progress?.percent ?? 0;
  const startDate = cohort.firstClassDate || cohort.startDate;

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-xs">
      {/* Left: Icon, Title, Description, Meta */}
      <div className="flex items-start gap-4 min-w-0">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
            meta.iconContainer,
          )}
        >
          <IconComponent className="size-6" />
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight truncate">
            {cohort.course.title || cohort.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {cohort.course.description || meta.fallbackDescription}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            {startDate && (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-muted-foreground/80" />
                Started {formatDate(startDate)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-medium">
              <BookOpen className="size-3.5 text-muted-foreground/80" />
              {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Progress bar & Open cohort button */}
      <div className="flex flex-col sm:items-end gap-3 shrink-0 sm:min-w-[200px]">
        <div className="w-full sm:w-48 space-y-1.5">
          <div className="flex items-center justify-end text-xs">
            <span className="font-semibold text-foreground">{percent}% complete</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          render={<Link href={`${hrefBase}/${cohort.id}`} />}
          className="rounded-full border-border/80 text-foreground hover:text-primary hover:border-primary/50 text-xs sm:text-sm font-medium px-4 w-fit sm:self-end transition-colors"
        >
          Open cohort <ArrowRight className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
