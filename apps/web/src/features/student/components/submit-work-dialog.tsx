"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  const create = useMutation({
    mutationFn: () =>
      submissionsService.create({ lessonId, url: url.trim(), ...(note.trim() ? { note: note.trim() } : {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-submissions", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohort-progress", cohortId] });
      toast.success("Work submitted");
      setUrl("");
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your work</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            For <span className="font-medium text-foreground">{lessonTitle}</span>
          </p>

          <FormField label="Link to your work" htmlFor="classSubmissionUrl">
            <Input
              id="classSubmissionUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
          </FormField>

          <FormField label="Note for your mentor (optional)" htmlFor="classSubmissionNote">
            <Textarea
              id="classSubmissionNote"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything they should know before reviewing it."
            />
          </FormField>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !url.trim()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
