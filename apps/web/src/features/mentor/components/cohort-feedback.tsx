"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Trash2, Download } from "lucide-react";
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

  const downloadCSV = () => {
    if (!feedback || feedback.length === 0) return;
    
    // Get all unique questions from all feedback entries to form the headers
    const allQuestions = new Set<string>();
    feedback.forEach(entry => {
      Object.keys(entry.responses || {}).forEach(q => allQuestions.add(q));
    });
    
    const questionsArray = Array.from(allQuestions);
    const headers = ["Student", "Date", "Module", "Lesson", ...questionsArray];
    
    const escapeCSV = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
    
    const rows = feedback.map(entry => {
      const studentName = fullName(entry.student);
      const date = new Date(entry.createdAt).toLocaleDateString();
      const baseRow = [studentName, date, entry.moduleTitle, entry.lessonTitle];
      
      const responseRow = questionsArray.map(q => entry.responses?.[q] || "");
      
      return [...baseRow, ...responseRow].map(escapeCSV).join(",");
    });
    
    const csvContent = [headers.map(escapeCSV).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cohort-${cohortId}-feedback.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {feedback.length} {feedback.length === 1 ? "message" : "messages"} across{" "}
          {byLesson.size} {byLesson.size === 1 ? "class" : "classes"}. Students can&apos;t see these once sent.
        </p>
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

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
                  <div key={entry.id} className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="text-[11px] font-medium text-muted-foreground border-b border-border/40 pb-1.5 mb-1">
                        {fullName(entry.student)} · {formatRelativeTime(entry.createdAt)}
                      </span>
                      <div className="flex flex-col gap-3.5">
                        {Object.entries(entry.responses || {}).map(([question, answer]: [string, any]) => (
                          <div key={question} className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{question}</span>
                            {question === "Project heaviness" ? (
                              <div className="mt-0.5">
                                <Badge variant={answer.includes("easy") ? "secondary" : answer.includes("feasible") ? "default" : "destructive"}>
                                  {answer}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-foreground whitespace-pre-wrap">{answer}</span>
                            )}
                          </div>
                        ))}
                      </div>
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
