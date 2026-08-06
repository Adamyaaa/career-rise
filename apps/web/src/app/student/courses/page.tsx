"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesService } from "@/services/courses.service";
import { currentMockStudentId } from "@/lib/mock-seed";
import { formatDate } from "@/lib/format";

export default function StudentCoursesPage() {
  const { data: cohorts, isLoading } = useQuery({
    queryKey: ["my-cohorts", currentMockStudentId],
    queryFn: () => coursesService.listMyCohorts(currentMockStudentId),
  });

  return (
    <>
      <PageHeading title="My courses" description="Cohorts you're currently enrolled in." />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && cohorts?.length === 0 && (
        <EmptyState icon={BookOpen} title="No active cohorts" description="You're not enrolled in a cohort yet." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cohorts?.map((cohort) => (
          <Card key={cohort.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{cohort.courseTitle}</CardTitle>
                <StatusBadge status={cohort.status} />
              </div>
              <CardDescription>{cohort.name}</CardDescription>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
              </p>
              <p className="text-xs text-muted-foreground">Mentors: {cohort.mentorNames.join(", ")}</p>
            </CardHeader>
            <CardFooter>
              <Button size="sm" render={<Link href={`/student/courses/${cohort.id}`} />}>
                Open course <ArrowRight className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
