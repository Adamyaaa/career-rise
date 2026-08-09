"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { feedbackService } from "@/services/learning.service";
import { toast } from "sonner";

// Write-only by design: the student sends feedback and never sees it again. There is no
// read endpoint for them to call, so nothing is listed here.
export function LessonFeedbackComposer({ lessonId }: { lessonId: string }) {
  const [body, setBody] = useState("");
  const [justSent, setJustSent] = useState(false);

  const send = useMutation({
    mutationFn: () => feedbackService.post(lessonId, body),
    onSuccess: () => {
      setBody("");
      setJustSent(true);
      toast.success("Feedback sent to your mentor");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't send that — try again"),
  });

  const submit = () => {
    if (!body.trim()) return;
    send.mutate();
  };

  if (justSent) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3.5 text-primary" />
          Feedback sent — only your mentor can see it.
        </p>
        <Button variant="ghost" size="sm" onClick={() => setJustSent(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <MessageSquare className="size-3.5" />
        Feedback on this class — goes privately to your mentor
      </p>
      <div className="flex items-center gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="How was this class?"
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={submit} disabled={send.isPending || !body.trim()}>
          <Send className="size-3.5" />
          Send
        </Button>
      </div>
    </div>
  );
}
