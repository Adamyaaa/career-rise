"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  Bot,
  Briefcase,
  Layers,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { MyCohortSummary } from "@/services/learning.service";
import { learningService } from "@/services/learning.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Generate distinct YouTube-style thumbnail gradients & icons per course topic
function getCourseThumbnailMeta(title: string, category?: string[]) {
  const t = title.toLowerCase();
  if (t.includes("agent") || t.includes("ai") || t.includes("llm") || t.includes("genai")) {
    return {
      gradient: "from-amber-500/20 via-orange-500/15 to-primary/30",
      accentBorder: "border-primary/30",
      icon: Sparkles,
      iconBg: "bg-primary/20 text-primary",
      tag: "AI & Engineering",
      pattern: "radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
    };
  }
  if (t.includes("product") || t.includes("management") || t.includes("pm")) {
    return {
      gradient: "from-rose-500/20 via-pink-500/15 to-purple-600/30",
      accentBorder: "border-purple-500/30",
      icon: Briefcase,
      iconBg: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      tag: "Product & Strategy",
      pattern: "radial-gradient(circle at 80% 20%, rgba(217, 70, 239, 0.15) 0%, transparent 70%)",
    };
  }
  return {
    gradient: "from-blue-500/20 via-indigo-500/15 to-cyan-500/30",
    accentBorder: "border-blue-500/30",
    icon: Layers,
    iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    tag: category?.[0] || "Cohort Track",
    pattern: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
  };
}

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
  const isActive = isStudent ? (!cohort.enrollmentStatus || cohort.enrollmentStatus === "active") : true;
  const isPending = isStudent && cohort.enrollmentStatus === "pending";
  const isUnenrolled = isStudent && (cohort.enrollmentStatus === "unenrolled" || cohort.enrollmentStatus === "withdrawn");

  const meta = getCourseThumbnailMeta(cohort.course.title);
  const IconComponent = meta.icon;

  const totalLessons = cohort.progress?.totalLessons ?? 0;
  const completedLessons = cohort.progress?.completedLessons ?? 0;
  const percent = cohort.progress?.percent ?? 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {/* 1. YouTube-Style Thumbnail Header */}
      {isActive ? (
        <Link
          href={`${hrefBase}/${cohort.id}`}
          className={cn(
            "relative aspect-video w-full overflow-hidden bg-gradient-to-br p-4 flex flex-col justify-between select-none cursor-pointer group/thumb",
            meta.gradient,
          )}
          style={{ backgroundImage: meta.pattern }}
        >
          {/* Subtle grid mesh overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Top Badges Row */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-2xs">
              {meta.tag}
            </span>

            <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-bold text-primary-foreground tracking-wider uppercase backdrop-blur-md shadow-2xs">
              {cohort.name}
            </span>
          </div>

          {/* Center Aesthetic Topic Icon */}
          <div className="relative z-10 my-auto flex items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-background/60 backdrop-blur-md shadow-xs ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
              <IconComponent className="size-7 text-foreground/80" />
            </div>
          </div>

          {/* Bottom Metadata Badges */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            {isStudent && (
              <div>
                {cohort.course.requiresApproval && isUnenrolled && (
                  <Badge variant="outline" className="border-amber-400/40 bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 backdrop-blur-xs">
                    <ShieldAlert className="mr-1 size-3" /> Approval Required
                  </Badge>
                )}
                {isPending && (
                  <Badge variant="outline" className="border-amber-400/40 bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 backdrop-blur-xs">
                    <Clock className="mr-1 size-3" /> Pending Approval
                  </Badge>
                )}
              </div>
            )}

            {/* YouTube-style Duration / Lesson Badge */}
            {totalLessons > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
                <BookOpen className="size-3" />
                {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
              </span>
            )}
          </div>

          {/* YouTube-style Progress Line right at bottom edge of thumbnail */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 w-full bg-black/20">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </Link>
      ) : (
        <div
          className={cn(
            "relative aspect-video w-full overflow-hidden bg-gradient-to-br p-4 flex flex-col justify-between select-none",
            meta.gradient,
          )}
          style={{ backgroundImage: meta.pattern }}
        >
          {/* Subtle grid mesh overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Top Badges Row */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-2xs">
              {meta.tag}
            </span>

            <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-bold text-primary-foreground tracking-wider uppercase backdrop-blur-md shadow-2xs">
              {cohort.name}
            </span>
          </div>

          {/* Center Aesthetic Topic Icon */}
          <div className="relative z-10 my-auto flex items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-background/60 backdrop-blur-md shadow-xs ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
              <IconComponent className="size-7 text-foreground/80" />
            </div>
          </div>

          {/* Bottom Metadata Badges */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            {isStudent && (
              <div>
                {cohort.course.requiresApproval && isUnenrolled && (
                  <Badge variant="outline" className="border-amber-400/40 bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 backdrop-blur-xs">
                    <ShieldAlert className="mr-1 size-3" /> Approval Required
                  </Badge>
                )}
                {isPending && (
                  <Badge variant="outline" className="border-amber-400/40 bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 backdrop-blur-xs">
                    <Clock className="mr-1 size-3" /> Pending Approval
                  </Badge>
                )}
              </div>
            )}

            {/* YouTube-style Duration / Lesson Badge */}
            {totalLessons > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
                <BookOpen className="size-3" />
                {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 gap-5">
        <div className="flex flex-col gap-2">
          {/* Title */}
          {isActive ? (
            <Link href={`${hrefBase}/${cohort.id}`} className="block">
              <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                {cohort.course.title}
              </h3>
            </Link>
          ) : (
            <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {cohort.course.title}
            </h3>
          )}

          {/* Subtitle / Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground/70" />
              Started {formatDate(cohort.firstClassDate ?? cohort.startDate)}
            </span>
          </div>

          {/* Progress summary label */}
          {isActive && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">
                {percent === 100 ? "Completed" : `${percent}% completed`}
              </span>
              {totalLessons > 0 && (
                <span className="tabular-nums font-mono text-[11px]">
                  {completedLessons}/{totalLessons} lessons
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Card Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
          {isActive && (
            <>
              {isStudent ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
                className="ml-auto rounded-xl gap-2 font-medium px-4 shadow-xs"
                render={<Link href={`${hrefBase}/${cohort.id}`} />}
              >
                <span>Open cohort</span>
                <ArrowRight className="size-4" />
              </Button>
            </>
          )}

          {isPending && (
            <Button size="sm" className="w-full rounded-xl" disabled variant="outline">
              Pending Approval
            </Button>
          )}

          {isUnenrolled && !cohort.course.requiresApproval && (
            <Button size="sm" className="w-full rounded-xl" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
              Enroll for Free
            </Button>
          )}

          {isUnenrolled && cohort.course.requiresApproval && (
            <Button
              size="sm"
              className="w-full rounded-xl"
              onClick={() => enroll.mutate()}
              disabled={enroll.isPending}
            >
              Request Access
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
