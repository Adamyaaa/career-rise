"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { evidenceService } from "@/services/evidence.service";
import { currentMockStudentId } from "@/lib/mock-seed";

export default function AssignmentsPage() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments", currentMockStudentId],
    queryFn: () => evidenceService.listAssignments(currentMockStudentId),
  });

  return (
    <>
      <PageHeading title="Assignments" description="Every activity that needs learning evidence." />

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      )}

      {!isLoading && assignments?.length === 0 && (
        <EmptyState icon={ClipboardList} title="No assignments yet" />
      )}

      {!isLoading && assignments && assignments.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/student/assignments/${assignment.id}`} className="hover:underline">
                      <p className="font-medium text-foreground">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">{assignment.lessonTitle}</p>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{assignment.dueDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={assignment.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
