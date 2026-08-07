"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CohortCard } from "@/features/student/components/cohort-card";
import { learningService } from "@/services/learning.service";

export default function MyCohortsPage() {
  const { data: cohorts, isLoading } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });

  return (
    <>
      <PageHeading title="My Cohorts" description="Cohorts you mentor — share material directly into each one." />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 rounded-xl" />
        </div>
      )}

      {!isLoading && (!cohorts || cohorts.length === 0) && (
        <EmptyState icon={GraduationCap} title="No assigned cohorts yet" description="Once you're assigned to a cohort, it'll show up here." />
      )}

      <div className="flex flex-col gap-4">
        {cohorts?.map((cohort) => <CohortCard key={cohort.id} cohort={cohort} hrefBase="/mentor/cohorts" />)}
      </div>
    </>
  );
}
