"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert, Clock } from "lucide-react";
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
    onError: (err: Error) => toast.error(err.message || "Enrollment failed")
  });

  const unenroll = useMutation({
    mutationFn: () => learningService.selfUnenroll(cohort.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
      toast.success("Successfully un-enrolled");
    },
    onError: (err: Error) => toast.error(err.message || "Un-enrollment failed")
  });

  const isActive = !cohort.enrollmentStatus || cohort.enrollmentStatus === "active";
  const isPending = cohort.enrollmentStatus === "pending";
  const isUnenrolled = cohort.enrollmentStatus === "unenrolled" || cohort.enrollmentStatus === "withdrawn";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary/10 p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2 items-start">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">{cohort.name}</p>
            {cohort.course.requiresApproval && isUnenrolled && (
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                <ShieldAlert className="size-3 mr-1" /> Mentor Approval Required
              </Badge>
            )}
            {isPending && (
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                <Clock className="size-3 mr-1" /> Pending Approval
              </Badge>
            )}
          </div>
          <h2 className="font-heading text-2xl font-medium text-foreground">{cohort.course.title}</h2>
          <p className="text-sm text-muted-foreground">
            {cohort.progress ? `${cohort.progress.totalLessons} lessons · ` : ""}
            {/* First scheduled module when there is one, so this matches the cohort header. */}
            started {formatDate(cohort.firstClassDate ?? cohort.startDate)}
          </p>

          {isActive && cohort.progress && (
            <div className="mt-2 w-full max-w-xs">
              <Progress value={cohort.progress.percent} />
              <p className="mt-2 text-xs font-medium text-muted-foreground">{cohort.progress.percent}% complete</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-5">
          {isActive && (
            <div className="flex items-center gap-3">
              <Button 
                size="xl" 
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (confirm("Are you sure you want to un-enroll? Your progress will be saved if you return.")) {
                    unenroll.mutate();
                  }
                }} 
                disabled={unenroll.isPending}
              >
                Un-enroll
              </Button>
              <Button size="xl" render={<Link href={`${hrefBase}/${cohort.id}`} />}>
                Open cohort <ArrowRight className="size-4.5" />
              </Button>
            </div>
          )}
          {isPending && (
            <Button size="xl" disabled variant="outline">
              Pending Approval
            </Button>
          )}
          {isUnenrolled && !cohort.course.requiresApproval && (
            <Button size="xl" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
              Enroll for Free
            </Button>
          )}
          {isUnenrolled && cohort.course.requiresApproval && (
            <Button size="xl" disabled variant="outline" className="cursor-not-allowed">
              Mentor Access Required
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
