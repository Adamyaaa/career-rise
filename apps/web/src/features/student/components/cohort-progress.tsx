"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, ClipboardCheck, FileQuestion, Lock, Star, Users } from "lucide-react";
import { CircularProgress } from "@/components/common/circular-progress";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { learningService, type ModuleProgress, type ProgressSignalView } from "@/services/learning.service";
import { cn } from "@/lib/utils";

const SIGNAL_ICONS: Record<ProgressSignalView["type"], typeof CheckCircle2> = {
  evidence_submitted: ClipboardCheck,
  attendance: Users,
  review_score: Star,
  quiz_score: FileQuestion,
};

export function CohortProgressPanel({ cohortId, modules }: { cohortId: string; modules: ModuleProgress[] }) {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["cohort-progress", cohortId],
    queryFn: () => learningService.getCohortProgress(cohortId),
  });

  if (isLoading || !progress) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  const liveSignals = progress.signals.filter((s) => s.active);
  const plannedSignals = progress.signals.filter((s) => !s.active);

  const attendanceSignal = progress.signals.find((s) => s.type === "attendance");
  const submissionsSignal = progress.signals.find((s) => s.type === "evidence_submitted");

  return (
    <div className="flex flex-col gap-6">
      {/* Two distinct figures, deliberately not merged: one is what this student has done,
          the other is where the cohort has got to. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm ring-1 ring-foreground/10">
          <p className="font-heading text-lg font-medium text-foreground">Your progress</p>
          <div className="flex flex-col gap-3">
            {attendanceSignal && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Users className="size-4 text-primary" /> Attendance
                  </span>
                  <span className="text-muted-foreground">{Math.round(attendanceSignal.value! * 100)}%</span>
                </div>
                <Progress value={Math.round(attendanceSignal.value! * 100)} />
              </div>
            )}
            {submissionsSignal && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <ClipboardCheck className="size-4 text-primary" /> Submissions
                  </span>
                  <span className="text-muted-foreground">{Math.round(submissionsSignal.value! * 100)}%</span>
                </div>
                <Progress value={Math.round(submissionsSignal.value! * 100)} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-heading text-sm font-medium text-foreground">
              <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
              Cohort schedule
            </p>
            <span className="text-sm font-medium text-muted-foreground">{progress.schedulePercent}%</span>
          </div>
          <Progress value={progress.schedulePercent} />
          <p className="text-xs text-muted-foreground">
            {progress.elapsedLessons} of {progress.totalLessons} classes have run. This is the cohort&apos;s
            pace, not yours.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-sm font-semibold text-foreground">What counts towards your progress</h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {liveSignals.map((signal) => (
            <SignalCard key={signal.type} signal={signal} />
          ))}
        </div>
      </div>

      {plannedSignals.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-sm font-semibold text-foreground">Not tracked yet</h3>
          <p className="-mt-1 text-xs text-muted-foreground">
            These don&apos;t affect your progress until they&apos;re switched on for your cohort.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {plannedSignals.map((signal) => (
              <SignalCard key={signal.type} signal={signal} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-sm font-semibold text-foreground">By module</h3>
        <div className="flex flex-col gap-3">
          {modules.map((module) => (
            <div key={module.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{module.title}</span>
                <span className="text-muted-foreground">{module.percent}%</span>
              </div>
              <Progress value={module.percent} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SignalCard({ signal }: { signal: ProgressSignalView }) {
  const Icon = SIGNAL_ICONS[signal.type];
  const percent = signal.value === null ? null : Math.round(signal.value * 100);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl p-5 ring-1",
        signal.active ? "bg-card ring-foreground/10" : "bg-muted/30 ring-foreground/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            signal.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60",
          )}
        >
          {signal.active ? <Icon className="size-4" /> : <Lock className="size-3.5" />}
        </span>

        {signal.active ? (
          <span className="font-heading text-lg font-medium text-foreground">{percent}%</span>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            Coming soon
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <p
          className={cn(
            "font-heading text-sm font-medium",
            signal.active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {signal.label}
        </p>
        <p className="text-xs text-muted-foreground">{signal.description}</p>
      </div>

      {signal.active && signal.detail && (
        <div className="mt-1 flex flex-col gap-1.5">
          <Progress value={percent ?? 0} />
          <p className="text-xs text-muted-foreground">
            {signal.detail.total === 0
              ? "Nothing due yet"
              : `${signal.detail.completed} of ${signal.detail.total} submitted`}
          </p>
        </div>
      )}
    </div>
  );
}
