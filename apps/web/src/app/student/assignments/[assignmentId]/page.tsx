"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, MessageSquareText } from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { StatusBadge } from "@/components/common/status-badge";
import { RatingStars } from "@/components/common/rating-stars";
import { EvidenceUploadForm } from "@/features/student/components/evidence-upload-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { evidenceService } from "@/services/evidence.service";
import { formatDateTime } from "@/lib/format";

export default function AssignmentDetailPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = use(params);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => evidenceService.getAssignment(assignmentId),
  });

  const evidenceId = assignment?.lessonId === "lesson-1" ? "ev-1" : assignment?.lessonId === "lesson-2" ? "ev-2" : assignment?.lessonId === "lesson-3" ? "ev-3" : undefined;

  const { data: evidence } = useQuery({
    queryKey: ["evidence-for-assignment", evidenceId],
    queryFn: () => (evidenceId ? evidenceService.getEvidence(evidenceId) : undefined),
    enabled: !!evidenceId,
  });

  const { data: review } = useQuery({
    queryKey: ["review", evidenceId],
    queryFn: () => (evidenceId ? evidenceService.getReview(evidenceId) : undefined),
    enabled: !!evidenceId && assignment?.status === "reviewed",
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!assignment) return <p className="text-sm text-muted-foreground">Assignment not found.</p>;

  const needsSubmission = assignment.status === "not_started" || assignment.status === "in_progress";

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs items={[{ label: "Assignments", href: "/student/assignments" }, { label: assignment.title }]} />
      <div className="mt-2">
        <PageHeading title={assignment.title} description={assignment.lessonTitle} action={<StatusBadge status={assignment.status} />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructions</CardTitle>
          <CardDescription>Due {assignment.dueDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">{assignment.description}</p>
        </CardContent>
      </Card>

      {needsSubmission && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Submit your evidence</CardTitle>
            <CardDescription>Expected type: {assignment.expectedEvidenceType.replace("_", " ")}</CardDescription>
          </CardHeader>
          <CardContent>
            <EvidenceUploadForm assignment={assignment} />
          </CardContent>
        </Card>
      )}

      {!needsSubmission && evidence && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Your submission</CardTitle>
            <CardDescription>Submitted {formatDateTime(evidence.submittedAt)}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2.5 text-sm">
            {evidence.externalUrl ? (
              <a href={evidence.externalUrl} className="flex items-center gap-1.5 text-primary hover:underline">
                <ExternalLink className="size-3.5" />
                {evidence.externalUrl}
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-foreground">
                <FileText className="size-3.5" />
                {evidence.fileName}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {assignment.status === "submitted" && (
        <p className="mt-3 text-sm text-muted-foreground">Your mentor hasn&apos;t reviewed this yet — check back soon.</p>
      )}

      {assignment.status === "reviewed" && review && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareText className="size-4 text-primary" />
              Mentor feedback — {review.mentorName}
            </CardTitle>
            <CardDescription>{formatDateTime(review.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {review.overallComment && <p className="text-sm text-foreground">{review.overallComment}</p>}
            <div className="flex flex-col gap-2.5">
              {review.scores.map((score) => (
                <div key={score.criterionId} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">{score.criterionName}</span>
                  <div className="flex items-center gap-2">
                    <RatingStars score={score.score} maxScore={score.maxScore} />
                    <span className="w-10 text-right text-sm font-medium text-foreground">
                      {score.score}/{score.maxScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
