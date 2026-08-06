"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { progressService } from "@/services/progress.service";
import { currentMockStudentId } from "@/lib/mock-seed";

export default function RoadmapPage() {
  const { data: milestones, isLoading } = useQuery({
    queryKey: ["roadmap", currentMockStudentId, "cohort-1"],
    queryFn: () => progressService.getRoadmap(currentMockStudentId, "cohort-1"),
  });

  return (
    <>
      <PageHeading title="Roadmap" description="Your path through this cohort." />

      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}

      <ol className="relative flex flex-col gap-8 border-l border-border pl-6">
        {milestones?.map((milestone) => (
          <li key={milestone.id} className="relative">
            <span
              className={cn(
                "absolute top-0.5 -left-[29px] flex size-5 items-center justify-center rounded-full bg-background",
                milestone.status === "completed" && "text-emerald-500",
                milestone.status === "current" && "text-primary",
                milestone.status === "upcoming" && "text-muted-foreground",
              )}
            >
              {milestone.status === "completed" && <CheckCircle2 className="size-5" />}
              {milestone.status === "current" && <CircleDot className="size-5" />}
              {milestone.status === "upcoming" && <Circle className="size-5" />}
            </span>
            <p
              className={cn(
                "text-sm font-medium",
                milestone.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {milestone.title}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{milestone.description}</p>
            {milestone.dueDate && (
              <p className="mt-1 text-xs text-muted-foreground">
                {milestone.status === "completed" ? "Completed" : "Due"} {milestone.dueDate}
              </p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
