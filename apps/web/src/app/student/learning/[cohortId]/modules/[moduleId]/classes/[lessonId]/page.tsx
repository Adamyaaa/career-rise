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
  Link as LinkIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { LessonFeedbackComposer } from "@/features/cohort/components/lesson-feedback-composer";
import { SubmitWorkDialog } from "@/features/student/components/submit-work-dialog";
import { learningService } from "@/services/learning.service";
import { submissionsService } from "@/services/submissions.service";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

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

  const { data: submissions } = useQuery({
    queryKey: ["cohort-submissions", cohortId],
    queryFn: () => submissionsService.list(cohortId),
  });

  const submission = submissions?.find((s) => s.lessonId === lessonId);
  const isSubmitted = !!submission;

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
            <div className="flex flex-wrap items-start justify-between gap-4 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tracking-wide text-primary uppercase">
                  Class {index >= 0 ? index + 1 : ""}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    lesson.cancelled
                      ? "text-destructive"
                      : isSubmitted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : lesson.completed
                          ? "text-primary"
                          : "hidden",
                  )}
                >
                  {lesson.cancelled ? (
                    <XCircle className="size-3.5" />
                  ) : isSubmitted ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : lesson.completed ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : null}
                  {lesson.cancelled ? "Cancelled" : isSubmitted ? "Submitted" : lesson.completed ? "Completed" : null}
                </span>
                {isSubmitted ? (
                  <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[10px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                    Submitted
                  </Badge>
                ) : lesson.submissionRequired ? (
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 text-[10px]">
                    Submission required
                  </Badge>
                ) : null}
              </div>
              <LessonFeedbackComposer lessonId={lesson.id} lessonTitle={lesson.title} buttonLabel="Give Feedback" />
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
              {lesson.slides.length > 0 ? (
                lesson.slides.map((slide, idx) => {
                  const ytId = getYouTubeId(slide.url);
                  if (ytId) {
                    return (
                      <div key={idx} className="overflow-hidden rounded-lg border border-border/60">
                        <iframe
                          className="w-full aspect-video"
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title={slide.title || "YouTube video"}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    );
                  }
                  return (
                    <MaterialRow
                      key={idx}
                      icon={LinkIcon}
                      label={slide.title || `Resource ${idx + 1}`}
                      url={slide.url}
                      emptyHint=""
                    />
                  );
                })
              ) : (
                <MaterialRow
                  icon={LinkIcon}
                  label="Resources"
                  url={null}
                  emptyHint="No resources shared yet"
                />
              )}
              <MaterialRow
                icon={FileText}
                label="Assignments"
                url={lesson.assignmentsUrl}
                emptyHint="No assignments shared yet"
              />

              {/* Sits with slides and assignments so everything to do with this class is
                  in one place, rather than only in the cohort-wide Submissions tab. */}
              {isSubmitted && submission ? (
                <div className="flex flex-col gap-3 rounded-lg border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {submission.projectName || "Work submitted"}
                          </span>
                          <Badge className="border-emerald-500/30 bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] uppercase tracking-wide">
                            {submission.status || "Submitted"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Submitted on {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                    </div>
                    <SubmitWorkDialog
                      cohortId={cohortId}
                      lessonId={lesson.id}
                      lessonTitle={lesson.title}
                      existingSubmission={submission}
                      buttonLabel="Update work"
                      buttonVariant="outline"
                      buttonClassName="border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs"
                    />
                  </div>

                  {(submission.githubUrl || submission.driveUrl || submission.projectSummary || submission.note) && (
                    <div className="flex flex-col gap-2 border-t border-emerald-500/20 pt-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {submission.githubUrl && (
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1.5 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            <LinkIcon className="size-3.5 text-primary" />
                            GitHub Repository
                            <ExternalLink className="size-3 text-muted-foreground" />
                          </a>
                        )}
                        {submission.driveUrl && (
                          <a
                            href={submission.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-2.5 py-1.5 font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            <ExternalLink className="size-3.5 text-primary" />
                            Google Drive
                          </a>
                        )}
                      </div>
                      {submission.projectSummary && (
                        <p className="text-xs text-foreground/80 leading-relaxed bg-background/60 rounded p-2 border border-border/40">
                          <span className="font-medium text-foreground">Summary:</span> {submission.projectSummary}
                        </p>
                      )}
                      {submission.note && (
                        <p className="text-xs text-muted-foreground italic">
                          <span className="font-medium not-italic text-foreground/70">Note to mentor:</span> {submission.note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
                    lesson.submissionRequired ? "border-amber-500/40 bg-amber-500/5" : "border-border/60 border-dashed",
                  )}
                >
                  <Upload
                    className={cn(
                      "size-4 shrink-0",
                      lesson.submissionRequired ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/50",
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
              )}
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
