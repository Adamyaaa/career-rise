"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { evidenceService } from "@/services/evidence.service";
import { formatRelativeTime } from "@/lib/format";

export default function ReviewQueuePage() {
  const { data: queue, isLoading } = useQuery({
    queryKey: ["review-queue", "cohort-1"],
    queryFn: () => evidenceService.listReviewQueue({ cohortId: "cohort-1" }),
  });

  return (
    <>
      <PageHeading title="Evidence reviews" description="Oldest-first review queue for your cohort." />

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      )}

      {!isLoading && queue?.length === 0 && (
        <EmptyState icon={ClipboardCheck} title="Queue is empty" description="No submissions are waiting on review." />
      )}

      {!isLoading && queue && queue.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((evidence) => (
                <TableRow key={evidence.id}>
                  <TableCell>
                    <Link href={`/mentor/reviews/${evidence.id}`} className="font-medium text-foreground hover:underline">
                      {evidence.studentName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{evidence.lessonTitle}</TableCell>
                  <TableCell className="text-muted-foreground">{formatRelativeTime(evidence.submittedAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={evidence.status} />
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
