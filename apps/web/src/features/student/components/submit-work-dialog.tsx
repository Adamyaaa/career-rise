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

// Submitting from a single class page: the class is already known, so unlike the
// Submissions tab there is no class picker here.
export function SubmitWorkDialog({
  cohortId,
  lessonId,
  lessonTitle,
}: {
  cohortId: string;
  lessonId: string;
  lessonTitle: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [linkType, setLinkType] = useState<"drive" | "github" | "both">("both");
  const [projectName, setProjectName] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [note, setNote] = useState("");

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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="size-3.5" />
        Submit work
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit your work</DialogTitle>
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
