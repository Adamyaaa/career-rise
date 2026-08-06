"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewForm } from "@/features/mentor/components/review-form";
import { evidenceService } from "@/services/evidence.service";
import { formatDateTime } from "@/lib/format";

export default function ReviewPage({ params }: { params: Promise<{ evidenceId: string }> }) {
  const { evidenceId } = use(params);

  const { data: evidence, isLoading } = useQuery({
    queryKey: ["evidence", evidenceId],
    queryFn: () => evidenceService.getEvidence(evidenceId),
  });
  const { data: criteria } = useQuery({
    queryKey: ["review-criteria", evidence?.cohortId],
    queryFn: () => evidenceService.listReviewCriteria(evidence!.cohortId),
    enabled: !!evidence,
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!evidence) return <p className="text-sm text-muted-foreground">Submission not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { label: "Evidence reviews", href: "/mentor/reviews" },
          { label: evidence.studentName },
        ]}
      />
      <div className="mt-2">
        <PageHeading title={`Review — ${evidence.studentName}`} description={evidence.lessonTitle} />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Submission</CardTitle>
          <CardDescription>Submitted {formatDateTime(evidence.submittedAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          {evidence.externalUrl ? (
            <a href={evidence.externalUrl} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ExternalLink className="size-3.5" />
              {evidence.externalUrl}
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-foreground">
              <FileText className="size-3.5" />
              {evidence.fileName}
            </span>
          )}
        </CardContent>
      </Card>

      {criteria && <ReviewForm evidence={evidence} criteria={criteria} />}
    </div>
  );
}
