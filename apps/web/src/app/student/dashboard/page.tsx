"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, CalendarCheck, FileCheck2, BookOpen, ArrowRight, MessageSquareText, Megaphone, Info } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { coursesService } from "@/services/courses.service";
import { progressService } from "@/services/progress.service";
import { evidenceService } from "@/services/evidence.service";
import { notificationsService } from "@/services/notifications.service";
import { currentMockStudentId } from "@/lib/mock-seed";
import { formatPercent, formatRelativeTime } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";

const SID = currentMockStudentId;
const COHORT_ID = "cohort-1";

const notifIcon = { review: MessageSquareText, attendance: CalendarCheck, announcement: Megaphone, system: Info };

export default function StudentDashboardPage() {
  const email = useAuthStore((s) => s.user?.email);

  const { data: cohort } = useQuery({ queryKey: ["cohort", COHORT_ID], queryFn: () => coursesService.getCohort(COHORT_ID) });
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["progress", SID, COHORT_ID],
    queryFn: () => progressService.getProgress(SID, COHORT_ID),
  });
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments", SID],
    queryFn: () => evidenceService.listAssignments(SID),
  });
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: notificationsService.list });

  const nextAssignment = assignments.find((a) => a.status === "not_started" || a.status === "in_progress");
  const dueSoon = assignments.filter((a) => a.status !== "reviewed").slice(0, 4);
  const attendanceSignal = progress?.signals.find((s) => s.signalType === "attendance");
  const evidenceSignal = progress?.signals.find((s) => s.signalType === "evidence_submitted");

  return (
    <>
      <PageHeading
        title={`Welcome back${email ? `, ${email.split("@")[0]}` : ""}`}
        description={cohort ? cohort.name : undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {progressLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Overall progress" value={formatPercent(progress?.overall ?? 0)} icon={TrendingUp} />
            <StatCard label="Attendance" value={formatPercent(attendanceSignal?.value ?? 0)} icon={CalendarCheck} />
            <StatCard
              label="Evidence submitted"
              value={`${assignments.filter((a) => a.status === "submitted" || a.status === "reviewed").length}/${assignments.length}`}
              icon={FileCheck2}
            />
            <StatCard label="Active cohort" value={cohort?.name ?? "—"} icon={BookOpen} />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Continue learning</CardTitle>
              <CardDescription>Pick up where you left off.</CardDescription>
            </CardHeader>
            <CardContent>
              {nextAssignment ? (
                <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{nextAssignment.lessonTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{nextAssignment.title}</p>
                  </div>
                  <Button size="sm" render={<Link href={`/student/lessons/${nextAssignment.lessonId}`} />}>
                    Continue <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You&apos;re all caught up on lessons.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignments due</CardTitle>
              <CardDescription>Evidence still needed or awaiting review.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {assignmentsLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
              {!assignmentsLoading && dueSoon.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing due — nice work.</p>
              )}
              {dueSoon.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/student/assignments/${assignment.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-sm text-foreground">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">Due {assignment.dueDate}</p>
                  </div>
                  <StatusBadge status={assignment.status} />
                </Link>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" render={<Link href="/student/assignments" />}>
                View all assignments <ArrowRight className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {notifications.slice(0, 5).map((n) => {
              const Icon = notifIcon[n.type];
              return (
                <div key={n.id} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" render={<Link href="/student/notifications" />}>
              View all <ArrowRight className="size-3.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
