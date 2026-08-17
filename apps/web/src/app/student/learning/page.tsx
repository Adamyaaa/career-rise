"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CohortCard } from "@/features/student/components/cohort-card";
import { ContinueLearningCard } from "@/features/student/components/continue-learning-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { learningService } from "@/services/learning.service";
import { useAuthStore } from "@/stores/auth-store";
import { displayName, formatDate } from "@/lib/format";

export default function MyLearningPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: cohorts, isLoading } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });

  const { data: allCohorts, isLoading: isLoadingAll } = useQuery({
    queryKey: ["available-cohorts"],
    queryFn: learningService.listCohorts,
  });

  const enrollMutation = useMutation({
    mutationFn: learningService.enrollSelf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
      queryClient.invalidateQueries({ queryKey: ["available-cohorts"] });
    },
  });

  const myCohortIds = new Set(cohorts?.map((c) => c.id) || []);
  const availableCohorts = allCohorts?.filter((c) => !myCohortIds.has(c.id));
  const hasCohorts = cohorts && cohorts.length > 0;

  // The cohort to lead with: the first one still in progress, or just the first one if
  // every cohort is already complete.
  const primaryCohort = cohorts?.find((c) => (c.progress?.percent ?? 0) < 100) ?? cohorts?.[0];
  const otherCohorts = cohorts?.filter((c) => c.id !== primaryCohort?.id) ?? [];

  return (
    <>
      <PageHeading
        title={`Hi, ${user ? displayName(user) : "there"}`}
        description="Your active cohort — study plan, resources, and progress."
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 rounded-xl" />
        </div>
      )}

      {!isLoading && !hasCohorts && (!availableCohorts || availableCohorts.length === 0) && (
        <EmptyState
          icon={GraduationCap}
          title="No active cohort yet"
          description="Once you're enrolled in a cohort, it'll show up here."
        />
      )}

      {hasCohorts && primaryCohort && (
        <div className="flex flex-col gap-8">
          <ContinueLearningCard cohort={primaryCohort} />

          {otherCohorts.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-medium text-foreground">Other cohorts</h2>
              {otherCohorts.map((cohort) => (
                <CohortCard key={cohort.id} cohort={cohort} hrefBase="/student/learning" />
              ))}
            </div>
          )}
        </div>
      )}

      {!isLoadingAll && availableCohorts && availableCohorts.length > 0 && (
        <div className="mt-12 flex flex-col gap-4">
          <h2 className="font-heading text-xl font-medium text-foreground">Available Cohorts</h2>
          {availableCohorts.map((cohort) => (
            <Card key={cohort.id}>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-medium tracking-wide text-primary uppercase">{cohort.name}</p>
                  <p className="font-heading text-lg font-medium text-foreground">{cohort.course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    starts {formatDate(cohort.firstClassDate ?? cohort.startDate)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={enrollMutation.isPending}
                  onClick={() => enrollMutation.mutate(cohort.id)}
                >
                  {enrollMutation.isPending && enrollMutation.variables === cohort.id ? "Enrolling..." : "Enroll"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
