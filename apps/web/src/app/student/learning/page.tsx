"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CohortCard } from "@/features/student/components/cohort-card";
import { learningService } from "@/services/learning.service";
import { useAuthStore } from "@/stores/auth-store";

export default function MyLearningPage() {
  const user = useAuthStore((s) => s.user);

  const { data: cohorts, isLoading } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });

  return (
    <>
      <PageHeading
        title={`Hi, ${user?.email.split("@")[0] ?? "there"}`}
        description="Your active cohort — study plan, resources, and progress."
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 rounded-xl" />
        </div>
      )}

      {!isLoading && (!cohorts || cohorts.length === 0) && (
        <EmptyState
          icon={GraduationCap}
          title="No active cohort yet"
          description="Once you're enrolled in a cohort, it'll show up here."
        />
      )}

      <div className="flex flex-col gap-4">
        {cohorts?.map((cohort) => <CohortCard key={cohort.id} cohort={cohort} />)}
      </div>
    </>
  );
}
