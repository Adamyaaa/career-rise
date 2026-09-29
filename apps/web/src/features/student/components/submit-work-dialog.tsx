"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submissionsService } from "@/services/submissions.service";
import { toast } from "sonner";

import type { Submission } from "@/services/submissions.service";

// Submitting from a single class page: the class is already known, so unlike the
// Submissions tab there is no class picker here.
export function SubmitWorkDialog({
  cohortId,
  lessonId,
  lessonTitle,
  existingSubmission,
  buttonLabel,
  buttonVariant = "outline",
  buttonSize = "sm",
  buttonClassName,
}: {
  cohortId: string;
  lessonId: string;
  lessonTitle: string;
  existingSubmission?: Submission;
  buttonLabel?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [linkType, setLinkType] = useState<"drive" | "github" | "both">(
    existingSubmission?.githubUrl && !existingSubmission?.driveUrl
      ? "github"
      : existingSubmission?.driveUrl && !existingSubmission?.githubUrl
        ? "drive"
        : "both"
  );
  const [projectName, setProjectName] = useState(existingSubmission?.projectName ?? "");
  const [driveUrl, setDriveUrl] = useState(existingSubmission?.driveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(existingSubmission?.githubUrl ?? "");
  const [projectSummary, setProjectSummary] = useState(existingSubmission?.projectSummary ?? "");
  const [note, setNote] = useState(existingSubmission?.note ?? "");

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen && existingSubmission) {
      setProjectName(existingSubmission.projectName ?? "");
      setDriveUrl(existingSubmission.driveUrl ?? "");
      setGithubUrl(existingSubmission.githubUrl ?? "");
      setProjectSummary(existingSubmission.projectSummary ?? "");
      setNote(existingSubmission.note ?? "");
      setLinkType(
        existingSubmission.githubUrl && !existingSubmission.driveUrl
          ? "github"
          : existingSubmission.driveUrl && !existingSubmission.githubUrl
            ? "drive"
            : "both"
      );
    }
    setOpen(nextOpen);
  };

  const isLinkValid = () => {
    if (linkType === "drive") return driveUrl.trim().length > 0;
    if (linkType === "github") return githubUrl.trim().length > 0;
    return driveUrl.trim().length > 0 || githubUrl.trim().length > 0;
  };

  const create = useMutation({
    mutationFn: () =>
      submissionsService.create({
        lessonId,
        projectName: projectName.trim(),
        ...(driveUrl.trim() ? { driveUrl: driveUrl.trim() } : {}),
        ...(githubUrl.trim() ? { githubUrl: githubUrl.trim() } : {}),
        ...(projectSummary.trim() ? { projectSummary: projectSummary.trim() } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-submissions", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohort-progress", cohortId] });
      toast.success("Work submitted");
      setProjectName("");
      setDriveUrl("");
      setGithubUrl("");
      setProjectSummary("");
      setNote("");
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't submit that — try again"),
  });

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={buttonClassName}
        onClick={() => handleOpen(true)}
      >
        <Upload className="size-3.5" />
        {buttonLabel || (existingSubmission ? "Update work" : "Submit work")}
      </Button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{existingSubmission ? "Update your submission" : "Submit your work"}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            For <span className="font-medium text-foreground">{lessonTitle}</span>
          </p>

          <div className="grid gap-4 py-4">
            <FormField label="Project Name" htmlFor="projectName">
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Project"
              />
            </FormField>

            <FormField label="Link Type" htmlFor="linkType">
              <Select value={linkType} onValueChange={(val: any) => setLinkType(val)}>
                <SelectTrigger id="linkType" className="w-full">
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

            {(linkType === "both" || linkType === "github") && (
              <FormField label="GitHub Repository Link" htmlFor="githubUrl">
                <Input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </FormField>
            )}

            {(linkType === "both" || linkType === "drive") && (
              <FormField label="Google Drive Link" htmlFor="driveUrl">
                <Input
                  id="driveUrl"
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </FormField>
            )}

            <FormField label="Project Summary (optional)" htmlFor="projectSummary">
              <Textarea
                id="projectSummary"
                rows={2}
                value={projectSummary}
                onChange={(e) => setProjectSummary(e.target.value)}
                placeholder="A brief summary of your project..."
              />
            </FormField>

            <FormField label="Note for your mentor (optional)" htmlFor="classSubmissionNote">
              <Textarea
                id="classSubmissionNote"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything they should know before reviewing it."
              />
            </FormField>
          </div>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !projectName.trim() || !isLinkValid()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
