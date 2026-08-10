"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { feedbackService, type FeedbackEntry } from "@/services/learning.service";
import { fullName, formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";

export function CohortFeedback({ cohortId }: { cohortId: string }) {
  const queryClient = useQueryClient();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["cohort-feedback", cohortId],
    queryFn: () => feedbackService.listForCohort(cohortId),
  });

  const remove = useMutation({
    mutationFn: (id: string) => feedbackService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-feedback", cohortId] });
      toast.success("Feedback deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't delete that — try again"),
  });

  const handleDelete = (entry: FeedbackEntry) => {
    // The student can't see or resend this, so there's no undo — confirm first.
    if (confirm(`Delete this feedback from ${fullName(entry.student)}? This cannot be undone.`)) {
      remove.mutate(entry.id);
    }
  };

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
                  <div key={entry.id} className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {fullName(entry.student)} · {formatRelativeTime(entry.createdAt)}
                      </span>
                      <span className="text-sm text-foreground">{entry.body}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(entry)}
                      disabled={remove.isPending}
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      aria-label={`Delete feedback from ${fullName(entry.student)}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
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
