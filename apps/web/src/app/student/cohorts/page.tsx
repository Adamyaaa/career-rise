"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Sparkles } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CohortCard } from "@/features/student/components/cohort-card";
import { learningService } from "@/services/learning.service";
import { useAuthStore } from "@/stores/auth-store";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function StudentCohortsPage() {
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const { data: cohorts, isLoading } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });

  const filteredCohorts = (cohorts || []).filter((cohort) => {
    const isCompleted = (cohort.progress?.percent ?? 0) >= 100;
    const isActive = !cohort.enrollmentStatus || cohort.enrollmentStatus === "active";
    if (filter === "active") return isActive && !isCompleted;
    if (filter === "completed") return isCompleted;
    return true;
  });

  const hasCohorts = filteredCohorts.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeading
          title="My Cohorts"
          description={`Your enrolled cohorts, study plans, and learning progress for ${user ? displayName(user) : "your account"}.`}
        />

        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
              filter === "all"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All ({(cohorts || []).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
              filter === "active"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
              filter === "completed"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Completed
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      )}

      {!isLoading && !hasCohorts && (
        <EmptyState
          icon={GraduationCap}
          title="No cohorts found"
          description={
            filter === "all"
              ? "Once you are enrolled in a cohort, it will show up here."
              : `You have no ${filter === "active" ? "active" : "completed"} cohorts right now.`
          }
        />
      )}

      {!isLoading && hasCohorts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredCohorts.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} hrefBase="/student/learning" />
          ))}
        </div>
      )}
    </div>
  );
}
