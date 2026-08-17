"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PartyPopper, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/common/circular-progress";
import { learningService } from "@/services/learning.service";
import type { MyCohortSummary } from "@/services/learning.service";

export function ContinueLearningCard({ cohort }: { cohort: MyCohortSummary }) {
  const { data: modules } = useQuery({
    queryKey: ["cohort-modules", cohort.id],
    queryFn: () => learningService.getCohortModules(cohort.id),
  });

  // First lesson, in study-plan order, the student hasn't completed yet.
  const next = modules
    ?.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })))
    .find(({ lesson }) => !lesson.completed);

  const percent = cohort.progress?.percent ?? 0;
  const isComplete = percent >= 100;

  const href = next
    ? `/student/learning/${cohort.id}?module=${next.module.id}`
    : `/student/learning/${cohort.id}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {isComplete ? "Cohort complete" : "Continue learning"}
          </p>
          <h2 className="font-heading text-2xl font-medium text-foreground">{cohort.course.title}</h2>

          {isComplete ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <PartyPopper className="size-4 shrink-0 text-primary" />
              You&apos;ve completed every lesson in this cohort.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Next up:{" "}
              <span className="font-medium text-foreground">{next?.lesson.title ?? "your next lesson"}</span>
              {next && <span> · {next.module.title}</span>}
            </p>
          )}

          {cohort.progress && (
            <p className="text-xs text-muted-foreground">
              {cohort.progress.completedLessons} of {cohort.progress.totalLessons} lessons complete
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <CircularProgress percent={percent} size={64} strokeWidth={5} />
          <Button size="xl" render={<Link href={href} />}>
            {isComplete ? (
              <>
                Review cohort <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                Resume lesson <PlayCircle className="size-4.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
