"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  Presentation,
  Upload,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { LessonFeedbackComposer } from "@/features/cohort/components/lesson-feedback-composer";
import { SubmitWorkDialog } from "@/features/student/components/submit-work-dialog";
import { learningService } from "@/services/learning.service";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string; moduleId: string; lessonId: string }>;
}) {
  const { cohortId, moduleId, lessonId } = use(params);

  // Same query key as the cohort and module pages, so navigating in is served from cache.
  const { data: modules, isLoading } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => learningService.getCohortModules(cohortId),
  });

  const module = modules?.find((m) => m.id === moduleId);
  const lesson = module?.lessons.find((l) => l.id === lessonId);
  const index = module?.lessons.findIndex((l) => l.id === lessonId) ?? -1;

  return (
    <>
      <Link
        href={`/student/learning/${cohortId}/modules/${moduleId}`}
        className="mb-4 flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {module?.title ?? "module"}
      </Link>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      )}

      {!isLoading && !lesson && (
        <EmptyState
          icon={BookOpen}
          title="Class not found"
          description="It may have been removed from this module."
        />
      )}

      {lesson && (
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium tracking-wide text-primary uppercase">
                Class {index >= 0 ? index + 1 : ""}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  lesson.cancelled
                    ? "text-destructive"
                    : lesson.completed
                      ? "text-primary"
                      : "text-muted-foreground",
                )}
              >
                {lesson.cancelled ? (
                  <XCircle className="size-3.5" />
                ) : lesson.completed ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <Circle className="size-3.5" />
                )}
              {lesson.cancelled ? "Cancelled" : lesson.completed ? "Completed" : "Upcoming"}
              </span>
              {lesson.submissionRequired && (
                <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
                  Submission required
                </Badge>
              )}
            </div>

            <h1 className="font-heading text-2xl font-medium text-foreground">{lesson.title}</h1>

            {lesson.scheduledAt ? (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 shrink-0" />
                  {formatDate(lesson.scheduledAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 shrink-0" />
                  {formatTime(lesson.scheduledAt)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No date set for this class yet.</p>
            )}
          </div>

          <section className="flex flex-col gap-2 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="font-heading text-sm font-semibold text-foreground">What this class covers</h2>
            {lesson.content ? (
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{lesson.content}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your mentor hasn&apos;t added a summary for this class yet.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="font-heading text-sm font-semibold text-foreground">Material</h2>

            <div className="flex flex-col gap-2">
              <MaterialRow
                icon={Presentation}
                label="Slides"
                url={lesson.slidesUrl}
                emptyHint="No slides shared yet"
              />
              <MaterialRow
                icon={FileText}
                label="Assignments"
                url={lesson.assignmentsUrl}
                emptyHint="No assignments shared yet"
              />

              {/* Sits with slides and assignments so everything to do with this class is
                  in one place, rather than only in the cohort-wide Submissions tab. */}
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
                  lesson.submissionRequired ? "border-primary/40 bg-primary/5" : "border-border/60 border-dashed",
                )}
              >
                <Upload
                  className={cn(
                    "size-4 shrink-0",
                    lesson.submissionRequired ? "text-primary" : "text-muted-foreground/50",
                  )}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      lesson.submissionRequired ? "text-foreground" : "text-muted-foreground/70",
                    )}
                  >
                    Your work
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lesson.submissionRequired
                      ? "This class expects work to be handed in."
                      : "Optional for this class — submit anyway if you'd like feedback."}
                  </span>
                </div>
                <SubmitWorkDialog cohortId={cohortId} lessonId={lesson.id} lessonTitle={lesson.title} />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-sm font-semibold text-foreground">Feedback</h2>
              <p className="text-xs text-muted-foreground">
                You must provide feedback to mark this class as your progress (enter 'n/a' if you have none). Your mentor reads this privately.
              </p>
            </div>
            <div className="w-fit">
              <LessonFeedbackComposer lessonId={lesson.id} lessonTitle={lesson.title} buttonLabel="Feedback" />
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function MaterialRow({
  icon: Icon,
  label,
  url,
  emptyHint,
}: {
  icon: typeof Presentation;
  label: string;
  url: string | null;
  emptyHint: string;
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-border/60 border-dashed px-3 py-2.5">
        <Icon className="size-4 shrink-0 text-muted-foreground/50" />
        <span className="text-sm text-muted-foreground/70">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground/50">{emptyHint}</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <Icon className="size-4 shrink-0 text-primary" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <ExternalLink className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}
