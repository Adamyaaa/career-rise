"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, CalendarCheck, FileCheck2 } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { progressService } from "@/services/progress.service";
import { attendanceService } from "@/services/attendance.service";
import { evidenceService } from "@/services/evidence.service";
import { mockStudents } from "@/lib/mock-seed";
import { formatPercent, formatDateTime } from "@/lib/format";

export default function StudentDetailsPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const student = mockStudents.find((s) => s.id === studentId);

  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress", studentId, "cohort-1"],
    queryFn: () => progressService.getProgress(studentId, "cohort-1"),
  });
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance-student", studentId],
    queryFn: () => attendanceService.listForStudent(studentId, "cohort-1"),
  });
  const { data: evidence = [] } = useQuery({
    queryKey: ["evidence-student", studentId],
    queryFn: () => evidenceService.listEvidence({ studentId, cohortId: "cohort-1" }),
  });

  const attendanceSignal = progress?.signals.find((s) => s.signalType === "attendance");
  const evidenceSignal = progress?.signals.find((s) => s.signalType === "evidence_submitted");

  return (
    <>
      <Breadcrumbs items={[{ label: "Students", href: "/mentor/attendance" }, { label: student?.name ?? "Student" }]} />
      <div className="mt-2">
        <PageHeading title={student?.name ?? "Student"} description={student?.email} />
      </div>

      {isLoading ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Overall progress" value={formatPercent(progress?.overall ?? 0)} icon={TrendingUp} />
          <StatCard label="Attendance" value={formatPercent(attendanceSignal?.value ?? 0)} icon={CalendarCheck} />
          <StatCard label="Evidence submitted" value={formatPercent(evidenceSignal?.value ?? 0)} icon={FileCheck2} />
        </div>
      )}

      <Tabs defaultValue="evidence" className="mt-6">
        <TabsList>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="mt-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidence.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-foreground">{e.lessonTitle}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(e.submittedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-foreground">{a.sessionTitle}</TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
