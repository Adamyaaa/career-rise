"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/common/form-field";
import { EmptyState } from "@/components/common/empty-state";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submissionsService } from "@/services/submissions.service";
import { learningService } from "@/services/learning.service";
import { fullName, formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";

const emptyDraft = { 
  lessonId: "", 
  projectName: "", 
  linkType: "both" as "both" | "drive" | "github",
  driveUrl: "",
  githubUrl: "",
  projectSummary: "",
  note: "" 
};

// One component for both sides: a student sees only their own submissions and can add
// new ones; a mentor or admin sees the whole cohort's and can only clear them.
export function CohortSubmissions({ cohortId, canManage }: { cohortId: string; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["cohort-submissions", cohortId],
    queryFn: () => submissionsService.list(cohortId),
  });

  // Needed only to populate the "which class is this for?" picker.
  const { data: modules } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => learningService.getCohortModules(cohortId),
    enabled: !canManage,
  });

  const classes = modules?.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))) ?? [];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cohort-submissions", cohortId] });

  const create = useMutation({
    mutationFn: () =>
      submissionsService.create({
        lessonId: draft.lessonId,
        projectName: draft.projectName.trim(),
        ...(draft.driveUrl.trim() ? { driveUrl: draft.driveUrl.trim() } : {}),
        ...(draft.githubUrl.trim() ? { githubUrl: draft.githubUrl.trim() } : {}),
        ...(draft.projectSummary.trim() ? { projectSummary: draft.projectSummary.trim() } : {}),
        ...(draft.note.trim() ? { note: draft.note.trim() } : {}),
      }),
    onSuccess: () => {
      refresh();
      toast.success("Work submitted");
      setDraft(emptyDraft);
      setAdding(false);
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't submit that — try again"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => submissionsService.delete(id),
    onSuccess: () => {
      refresh();
      toast.success("Submission removed");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't remove that"),
  });

  const handleDelete = (id: string, lessonTitle: string) => {
    if (confirm(`Remove your submission for "${lessonTitle}"? This cannot be undone.`)) remove.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {!canManage && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Submit work
          </Button>
        </div>
      )}

      {submissions?.length === 0 && (
        <EmptyState
          icon={Upload}
          title="Nothing submitted yet"
          description={
            canManage
              ? "Work handed in by students in this cohort will show up here."
              : "Submit a link to your work and your mentor will see it here."
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {submissions?.map((submission) => (
          <Card key={submission.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="font-heading text-sm font-medium text-foreground">{submission.lessonTitle}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {submission.moduleTitle}
                    {canManage && ` · ${fullName(submission.student)}`} ·{" "}
                    {formatRelativeTime(submission.submittedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {submission.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(submission.id, submission.lessonTitle)}
                    disabled={remove.isPending}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Remove submission for ${submission.lessonTitle}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {submission.note && <p className="text-sm whitespace-pre-line text-foreground">{submission.note}</p>}

              {submission.url && (
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                  Open submission
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit your work</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <FormField label="Which class is this for?" htmlFor="submissionLesson">
              <Select value={draft.lessonId} onValueChange={(value) => setDraft({ ...draft, lessonId: value ?? "" })}>
                <SelectTrigger id="submissionLesson">
                  <SelectValue placeholder="Pick a class">
                    {(value: string | null) =>
                      classes.find((lesson) => lesson.id === value)?.title ?? "Pick a class"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classes.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Project Name" htmlFor="projectName">
              <Input
                id="projectName"
                value={draft.projectName}
                onChange={(e) => setDraft({ ...draft, projectName: e.target.value })}
                placeholder="My Awesome Project"
              />
            </FormField>

            <FormField label="Link Type" htmlFor="linkType">
              <Select value={draft.linkType} onValueChange={(val: any) => setDraft({ ...draft, linkType: val })}>
                <SelectTrigger id="linkType">
                  <SelectValue placeholder="Select type of link" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both (Drive & GitHub)</SelectItem>
                  <SelectItem value="github">GitHub Only</SelectItem>
                  <SelectItem value="drive">Drive Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                You must upload your materials to Drive or GitHub and share the link.
              </p>
            </FormField>

            {(draft.linkType === "both" || draft.linkType === "github") && (
              <FormField label="GitHub Repository Link" htmlFor="githubUrl">
                <Input
                  id="githubUrl"
                  type="url"
                  value={draft.githubUrl}
                  onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </FormField>
            )}

            {(draft.linkType === "both" || draft.linkType === "drive") && (
              <FormField label="Google Drive Link" htmlFor="driveUrl">
                <Input
                  id="driveUrl"
                  type="url"
                  value={draft.driveUrl}
                  onChange={(e) => setDraft({ ...draft, driveUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
              </FormField>
            )}

            <FormField label="Project Summary (optional)" htmlFor="projectSummary">
              <Textarea
                id="projectSummary"
                rows={2}
                value={draft.projectSummary}
                onChange={(e) => setDraft({ ...draft, projectSummary: e.target.value })}
                placeholder="A brief summary of your project..."
              />
            </FormField>

            <FormField label="Note for your mentor (optional)" htmlFor="submissionNote">
              <Textarea
                id="submissionNote"
                rows={2}
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="Anything they should know before reviewing it."
              />
            </FormField>
          </div>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => create.mutate()}
              disabled={
                create.isPending ||
                !draft.lessonId ||
                !draft.projectName.trim() ||
                (draft.linkType === "drive" && !draft.driveUrl.trim()) ||
                (draft.linkType === "github" && !draft.githubUrl.trim()) ||
                (draft.linkType === "both" && !draft.driveUrl.trim() && !draft.githubUrl.trim())
              }
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
