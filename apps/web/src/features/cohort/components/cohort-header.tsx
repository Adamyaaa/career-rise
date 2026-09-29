"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, GraduationCap, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { learningService } from "@/services/learning.service";
import { formatDate } from "@/lib/format";

function scheduleStatus(startDate: string, endDate: string) {
  const now = Date.now();
  if (now < new Date(startDate).getTime()) return "Starting soon";
  if (now > new Date(endDate).getTime()) return "Finished";
  return "In progress";
}

export function CohortHeader({ cohortId }: { cohortId: string }) {
  const { data: cohort, isLoading } = useQuery({
    queryKey: ["cohort-overview", cohortId],
    queryFn: () => learningService.getCohortOverview(cohortId),
  });

  if (isLoading || !cohort) {
    return <Skeleton className="h-32 rounded-2xl mb-6" />;
  }

  // Prefer the first scheduled module — that's the real first class. The cohort's own
  // startDate is a fallback for cohorts whose modules aren't dated yet.
  const start = cohort.firstClassDate ?? cohort.startDate;
  const hasStarted = new Date(start).getTime() <= Date.now();

  const meta = [
    { icon: GraduationCap, label: `${cohort.studentCount} ${cohort.studentCount === 1 ? "student" : "students"}` },
    { icon: Layers, label: `${cohort.moduleCount} ${cohort.moduleCount === 1 ? "module" : "modules"}` },
    { icon: BookOpen, label: `${cohort.taughtCount}/${cohort.lessonCount} classes delivered` },
    { icon: CalendarDays, label: `${hasStarted ? "Started" : "Starts"} ${formatDate(start)}` },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs ring-1 ring-foreground/5 mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground tracking-wider uppercase shadow-2xs">
              {cohort.name}
            </span>
            <Badge variant="outline" className="text-[11px] font-medium border-border/80">
              {scheduleStatus(start, cohort.endDate)}
            </Badge>
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">{cohort.course.title}</h2>
          {cohort.course.description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{cohort.course.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
            {meta.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1">
                <item.icon className="size-3.5 shrink-0 text-foreground/70" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
