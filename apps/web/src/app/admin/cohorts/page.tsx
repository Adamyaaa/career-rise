"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { formatDate } from "@/lib/format";

export default function AdminCohortsPage() {
  const { data: cohorts, isLoading } = useQuery({ queryKey: ["admin-cohorts"], queryFn: adminService.listCohorts });
  const { data: mentorLoad } = useQuery({
    queryKey: ["mentor-suggestions", "course-1"],
    queryFn: () => adminService.mentorSuggestions("course-1"),
  });

  return (
    <>
      <PageHeading title="Cohorts" description="Every cohort across all courses." action={<Button size="sm">New cohort</Button>} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          )}

          {!isLoading && cohorts?.length === 0 && <EmptyState icon={Building2} title="No cohorts yet" />}

          {!isLoading && cohorts && cohorts.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohorts.map((cohort) => (
                    <TableRow key={cohort.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{cohort.name}</p>
                        <p className="text-xs text-muted-foreground">{cohort.courseTitle}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cohort.studentCount}</TableCell>
                      <TableCell>
                        <StatusBadge status={cohort.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mentor load</CardTitle>
            <CardDescription>Ranked for Agentic AI assignment.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {mentorLoad?.map((mentor) => (
              <div key={mentor.userId} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{mentor.name}</span>
                  <span className="text-muted-foreground">
                    {mentor.activeStudentCount}/{mentor.capacity}
                  </span>
                </div>
                <Progress value={mentor.loadPercent} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
