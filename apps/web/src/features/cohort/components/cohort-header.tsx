"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, GraduationCap, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@/components/common/circular-progress";
import { learningService } from "@/services/learning.service";
import { formatDate } from "@/lib/format";

function scheduleStatus(startDate: string, endDate: string) {
  const now = Date.now();
  if (now < new Date(startDate).getTime()) return "Starting soon";
  if (now > new Date(endDate).getTime()) return "Finished";
  return "In progress";
}

export function CohortHeader({ cohortId }: { cohortId: string }) {
  const { data: cohort, isLoading } = useQuery({
    queryKey: ["cohort-overview", cohortId],
    queryFn: () => learningService.getCohortOverview(cohortId),
  });

  if (isLoading || !cohort) {
    return <Skeleton className="h-32 rounded-xl" />;
  }

  // Students see their own completion; mentors/admins get the cohort-wide average.
  const isStudent = cohort.myProgressPercent !== null;
  const percent = isStudent ? cohort.myProgressPercent! : cohort.cohortAvgPercent;

  const meta = [
    { icon: GraduationCap, label: `${cohort.studentCount} ${cohort.studentCount === 1 ? "student" : "students"}` },
    { icon: Layers, label: `${cohort.moduleCount} ${cohort.moduleCount === 1 ? "module" : "modules"}` },
    { icon: BookOpen, label: `${cohort.taughtCount}/${cohort.lessonCount} classes taught` },
    { icon: CalendarDays, label: `Started ${formatDate(cohort.startDate)}` },
  ];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px] tracking-wide uppercase">
              {cohort.name}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {scheduleStatus(cohort.startDate, cohort.endDate)}
            </Badge>
          </div>

          <h2 className="font-heading text-xl font-medium text-foreground">{cohort.course.title}</h2>
          <p className="max-w-prose text-sm text-muted-foreground">{cohort.course.description}</p>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {meta.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-1.5">
          <CircularProgress percent={percent} size={64} strokeWidth={5} />
          <span className="text-xs text-muted-foreground">{isStudent ? "your progress" : "cohort avg"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
