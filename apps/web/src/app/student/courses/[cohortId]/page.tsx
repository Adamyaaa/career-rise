"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, PlayCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesService } from "@/services/courses.service";
import { mockLessons, mockModules } from "@/lib/mock-seed";

export default function CourseDetailsPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = use(params);

  const { data: cohort } = useQuery({ queryKey: ["cohort", cohortId], queryFn: () => coursesService.getCohort(cohortId) });
  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules", cohortId],
    queryFn: () => coursesService.listModules(cohortId),
  });

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/student/courses" },
          { label: cohort?.name ?? "Course" },
        ]}
      />
      <div className="mt-2">
        <PageHeading title={cohort?.courseTitle ?? "Course"} description={cohort?.name} />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {modules?.map((module) => {
          const lessons = mockLessons.filter((l) => l.moduleId === module.id).sort((a, b) => a.order - b.order);
          return (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  Module {module.order} · {module.title}
                </CardTitle>
                <CardDescription>{lessons.length} lessons</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/student/lessons/${lesson.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    {lesson.completed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 text-sm text-foreground">{lesson.title}</span>
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Clock className="size-3" />
                      {lesson.durationMins}m
                    </Badge>
                    <PlayCircle className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {!isLoading && (!modules || modules.length === 0) && (
        <p className="text-sm text-muted-foreground">
          {mockModules.length === 0 ? "No modules yet." : ""}
        </p>
      )}
    </>
  );
}
