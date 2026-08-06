"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Users, TrendingUp, ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { evidenceService } from "@/services/evidence.service";
import { mockMentors, mockStudents, currentMockMentorId } from "@/lib/mock-seed";
import { formatRelativeTime } from "@/lib/format";

export default function MentorDashboardPage() {
  const mentor = mockMentors.find((m) => m.userId === currentMockMentorId);
  const { data: queue, isLoading } = useQuery({
    queryKey: ["review-queue", "cohort-1"],
    queryFn: () => evidenceService.listReviewQueue({ cohortId: "cohort-1" }),
  });

  return (
    <>
      <PageHeading title={`Welcome back, ${mentor?.name.split(" ")[0]}`} description="Agentic AI · Cohort 3" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending reviews" value={String(queue?.length ?? "—")} icon={ClipboardCheck} />
        <StatCard label="Students" value={String(mockStudents.length)} icon={Users} />
        <StatCard label="Your load" value={`${mentor?.activeStudentCount}/${mentor?.capacity}`} icon={TrendingUp} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Review queue</CardTitle>
          <CardDescription>Oldest submissions first.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          {queue?.slice(0, 5).map((evidence) => (
            <Link
              key={evidence.id}
              href={`/mentor/reviews/${evidence.id}`}
              className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{evidence.studentName}</p>
                <p className="text-xs text-muted-foreground">{evidence.lessonTitle} · {formatRelativeTime(evidence.submittedAt)}</p>
              </div>
              <StatusBadge status={evidence.status} />
            </Link>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" render={<Link href="/mentor/reviews" />}>
            View full queue <ArrowRight className="size-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
