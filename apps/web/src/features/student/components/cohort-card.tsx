"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert, Clock, BookOpen, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { MyCohortSummary } from "@/services/learning.service";
import { learningService } from "@/services/learning.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CohortCard({ cohort, hrefBase }: { cohort: MyCohortSummary; hrefBase: string }) {
  const queryClient = useQueryClient();

  const enroll = useMutation({
    mutationFn: () => learningService.selfEnroll(cohort.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
      if (data.status === "pending") {
        toast.success("Access request sent!");
      } else {
        toast.success("Successfully enrolled!");
      }
    },
    onError: (err: Error) => toast.error(err.message || "Enrollment failed"),
  });

  const unenroll = useMutation({
    mutationFn: () => learningService.selfUnenroll(cohort.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
      toast.success("Successfully un-enrolled");
    },
    onError: (err: Error) => toast.error(err.message || "Un-enrollment failed"),
  });

  const isStudent = hrefBase.startsWith("/student");
  const isActive = !cohort.enrollmentStatus || cohort.enrollmentStatus === "active";
  const isPending = cohort.enrollmentStatus === "pending";
  const isUnenrolled = cohort.enrollmentStatus === "unenrolled" || cohort.enrollmentStatus === "withdrawn";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-200 hover:border-border hover:shadow-md">
      <div className="flex flex-1 flex-col">
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-primary uppercase">
            {cohort.name}
          </span>
          <div className="flex items-center gap-1.5">
            {cohort.course.requiresApproval && isUnenrolled && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-600">
                <ShieldAlert className="mr-1 size-3" /> Approval Required
              </Badge>
            )}
            {isPending && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-600">
                <Clock className="mr-1 size-3" /> Pending Approval
              </Badge>
            )}
          </div>
        </div>

        {/* Title & metadata */}
        <div className="mt-4 flex flex-col gap-1.5">
          <h3 className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {cohort.course.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {cohort.progress && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-3.5 shrink-0 text-muted-foreground/70" />
                {cohort.progress.totalLessons} {cohort.progress.totalLessons === 1 ? "lesson" : "lessons"}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
              Started {formatDate(cohort.firstClassDate ?? cohort.startDate)}
            </span>
          </div>
        </div>

        {/* Progress */}
        {isActive && cohort.progress && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Progress</span>
              <span className="tabular-nums font-semibold text-foreground">
                {cohort.progress.percent}%
                {cohort.progress.totalLessons > 0 && (
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                    ({cohort.progress.completedLessons}/{cohort.progress.totalLessons} lessons)
                  </span>
                )}
              </span>
            </div>
            <Progress value={cohort.progress.percent} className="[&_[data-slot=progress-track]]:h-1.5" />
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
        {isActive && (
          <>
            {isStudent ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-9 px-3 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to un-enroll? Your progress will be saved if you return.")) {
                    unenroll.mutate();
                  }
                }}
                disabled={unenroll.isPending}
              >
                Un-enroll
              </Button>
            ) : (
              <div />
            )}
            <Button
              size="sm"
              className="ml-auto h-9 gap-2 px-4 font-medium shadow-xs"
              render={<Link href={`${hrefBase}/${cohort.id}`} />}
            >
              Open cohort <ArrowRight className="size-4" />
            </Button>
          </>
        )}
        {isPending && (
          <Button size="default" className="h-9 w-full" disabled variant="outline">
            Pending Approval
          </Button>
        )}
        {isUnenrolled && !cohort.course.requiresApproval && (
          <Button size="default" className="h-9 w-full" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
            Enroll for Free
          </Button>
        )}
        {isUnenrolled && cohort.course.requiresApproval && (
          <Button size="default" className="h-9 w-full cursor-not-allowed" disabled variant="outline">
            Mentor Access Required
          </Button>
        )}
      </div>
    </div>
  );
}
