"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { feedbackService, type FeedbackEntry } from "@/services/learning.service";
import { fullName, formatRelativeTime } from "@/lib/format";

export function CohortFeedback({ cohortId }: { cohortId: string }) {
  const { data: feedback, isLoading } = useQuery({
    queryKey: ["cohort-feedback", cohortId],
    queryFn: () => feedbackService.listForCohort(cohortId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!feedback || feedback.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No feedback yet"
        description="When students send feedback on a class, it shows up here."
      />
    );
  }

  // Grouped by class so it's obvious which lecture each comment is about, newest first.
  const byLesson = new Map<string, FeedbackEntry[]>();
  for (const entry of feedback) {
    const list = byLesson.get(entry.lessonId) ?? [];
    list.push(entry);
    byLesson.set(entry.lessonId, list);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {feedback.length} {feedback.length === 1 ? "message" : "messages"} across{" "}
        {byLesson.size} {byLesson.size === 1 ? "class" : "classes"}. Students can&apos;t see these once sent.
      </p>

      {Array.from(byLesson.values()).map((entries) => {
        const [first] = entries;
        return (
          <Card key={first.lessonId}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {first.moduleTitle}
                </Badge>
                <p className="font-heading text-sm font-medium text-foreground">{first.lessonTitle}</p>
                <span className="text-xs text-muted-foreground">
                  {entries.length} {entries.length === 1 ? "message" : "messages"}
                </span>
              </div>

              <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-0.5 rounded-md bg-muted/40 px-3 py-2">
                    <span className="text-[11px] text-muted-foreground">
                      {fullName(entry.student)} · {formatRelativeTime(entry.createdAt)}
                    </span>
                    <span className="text-sm text-foreground">{entry.body}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
