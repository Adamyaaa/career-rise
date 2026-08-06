"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { mockCohorts } from "@/lib/mock-seed";

export default function AdminCoursesPage() {
  const { data: courses, isLoading } = useQuery({ queryKey: ["admin-courses"], queryFn: adminService.listCourses });

  return (
    <>
      <PageHeading
        title="Courses"
        description="Course catalog — each course can have multiple cohorts."
        action={<Button size="sm">New course</Button>}
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      )}

      {!isLoading && courses?.length === 0 && <EmptyState icon={GraduationCap} title="No courses yet" />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {courses?.map((course) => {
          const cohortCount = mockCohorts.filter((c) => c.courseId === course.id).length;
          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <Badge variant="secondary">{cohortCount} cohorts</Badge>
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-1.5">
                {course.category.map((c) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
