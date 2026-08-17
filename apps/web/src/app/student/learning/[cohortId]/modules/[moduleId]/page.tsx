"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CalendarDays } from "lucide-react";
import { ClassCard } from "@/features/student/components/class-card";
import { CircularProgress } from "@/components/common/circular-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { learningService } from "@/services/learning.service";
import { formatDate } from "@/lib/format";

export default function ModuleDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string; moduleId: string }>;
}) {
  const { cohortId, moduleId } = use(params);

  // Same query key as the cohort page, so navigating in is served from cache.
  const { data: modules, isLoading } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => learningService.getCohortModules(cohortId),
  });

  const module = modules?.find((m) => m.id === moduleId);
  const index = modules?.findIndex((m) => m.id === moduleId) ?? -1;

  const dates =
    module?.lessons
      .map((l) => l.scheduledAt)
      .filter((d): d is string => d !== null)
      .sort() ?? [];

  return (
    <>
      <Link
        href={`/student/learning/${cohortId}`}
        className="mb-4 flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to your learnings
      </Link>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      )}

      {!isLoading && !module && (
        <EmptyState
          icon={BookOpen}
          title="Module not found"
          description="It may have been removed from this cohort's study plan."
        />
      )}

      {module && (
        <>
          <div className="mx-auto mb-6 flex max-w-5xl flex-col gap-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex min-w-0 flex-col gap-2">
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                Module {index >= 0 ? index + 1 : ""}
              </p>
              <h1 className="font-heading text-2xl font-medium text-foreground">{module.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-3.5 shrink-0" />
                  {module.totalLessons} {module.totalLessons === 1 ? "class" : "classes"}
                </span>
                {dates[0] && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0" />
                    {formatDate(dates[0])}
                    {dates[dates.length - 1] !== dates[0] && ` – ${formatDate(dates[dates.length - 1])}`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-1.5">
              <CircularProgress percent={module.percent} size={64} strokeWidth={5} />
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
          </div>

          {module.lessons.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No classes yet"
              description="Your mentor hasn't added any classes to this module."
            />
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
              {module.lessons.map((lesson, i) => (
                <ClassCard
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  href={`/student/learning/${cohortId}/modules/${moduleId}/classes/${lesson.id}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
