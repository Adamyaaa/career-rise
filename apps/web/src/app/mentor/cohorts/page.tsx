"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CohortCard } from "@/features/student/components/cohort-card";
import { learningService } from "@/services/learning.service";
import { useAuthStore } from "@/stores/auth-store";
import { displayName } from "@/lib/format";

export default function MyCohortsPage() {
  const user = useAuthStore((s) => s.user);
  // Admins reach this page too and see every cohort, not just assigned ones.
  const isAdmin = user?.role === "SUPER_ADMIN";

  const { data: cohorts, isLoading } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });

  return (
    <>
      <PageHeading
        title={`Hi, ${user ? displayName(user) : "there"}`}
        description={
          isAdmin
            ? "Every cohort — study plan, students, feedback, and announcements."
            : "Cohorts you mentor — study plan, students, feedback, and announcements."
        }
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 rounded-xl" />
        </div>
      )}

      {!isLoading && (!cohorts || cohorts.length === 0) && (
        <EmptyState
          icon={GraduationCap}
          title={isAdmin ? "No cohorts yet" : "No assigned cohorts yet"}
          description={
            isAdmin
              ? "Create one under Cohorts in the admin area."
              : "Once you're assigned to a cohort, it'll show up here."
          }
        />
      )}

      <div className="flex flex-col gap-4">
        {cohorts?.map((cohort) => <CohortCard key={cohort.id} cohort={cohort} hrefBase="/mentor/cohorts" />)}
      </div>
    </>
  );
}
