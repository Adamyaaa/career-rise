"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { feedbackService } from "@/services/learning.service";
import { toast } from "sonner";

// Write-only by design: the student sends feedback and never sees it again, so there's
// nothing to list here — just a trigger and a compose box.
export function LessonFeedbackComposer({ lessonId, lessonTitle, buttonLabel = "Feedback" }: { lessonId: string; lessonTitle: string; buttonLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");

  const send = useMutation({
    mutationFn: () => feedbackService.post(lessonId, body),
    onSuccess: () => {
      setBody("");
      setOpen(false);
      toast.success("Feedback sent — only your mentor can see it");
      // Page should probably be revalidated to show completion
      window.location.reload();
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't send that — try again"),
  });

  return (
    <>
      {/* Sits alongside the Slides link, styled to match it. */}
      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
      >
        <MessageSquare className="size-3.5" />
        {buttonLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback on this class</DialogTitle>
            <DialogDescription>
              {lessonTitle} — goes privately to your mentor. You won&apos;t see it again once sent.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="How was this class? What worked, what didn't?"
            rows={4}
            autoFocus
          />

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={() => send.mutate()} disabled={send.isPending || !body.trim()}>
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
