"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, Send, Sparkles, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mentorshipService, type PersonalMentorshipSession } from "@/services/mentorship.service";
import { toast } from "sonner";

interface RequestSessionDialogProps {
  session: PersonalMentorshipSession;
  mentorName?: string;
  children?: React.ReactNode;
}

export function RequestSessionDialog({
  session,
  mentorName,
  children,
}: RequestSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [preferredDate, setPreferredDate] = useState<string>(
    session.scheduledAt
      ? new Date(session.scheduledAt).toISOString().slice(0, 16)
      : "",
  );
  const [notes, setNotes] = useState<string>(session.studentNotes || "");

  const queryClient = useQueryClient();

  const requestMutation = useMutation({
    mutationFn: (payload: { scheduledAt: string; studentNotes: string }) =>
      mentorshipService.updateSession(session.id, {
        status: "requested",
        scheduledAt: new Date(payload.scheduledAt).toISOString(),
        studentNotes: payload.studentNotes.trim() || null,
      }),
    onSuccess: () => {
      toast.success("1:1 call request submitted! Your mentor has been notified.");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["mentorship-session", session.id] });
      queryClient.invalidateQueries({ queryKey: ["my-pro-track"] });
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate) {
      toast.error("Please pick your preferred date and time.");
      return;
    }
    requestMutation.mutate({
      scheduledAt: preferredDate,
      studentNotes: notes,
    });
  };

  // Default to at least tomorrow
  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={true}
        render={
          children ? (
            children as React.ReactElement
          ) : (
            <Button className="rounded-xl px-5 font-semibold gap-2 shadow-xs text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/95">
              <CalendarDays className="size-4" />
              <span>Request 1:1 Session Slot</span>
              <Sparkles className="size-3.5" />
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-5 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Video className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Request Week {session.weekNumber} Mentorship Call
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mentorName ? `With mentor ${mentorName}` : "With your senior mentor"} • 75 mins Google Meet call
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-background">
          <div className="space-y-1.5">
            <FormField
              label="Preferred Date & Time *"
              htmlFor="preferredDateTime"
            >
              <Input
                id="preferredDateTime"
                type="datetime-local"
                min={minDateTime}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                className="text-xs"
              />
            </FormField>
            <p className="text-[11px] text-muted-foreground">
              Select when you are available for the 75-minute live call
            </p>
          </div>

          <div className="space-y-1.5">
            <FormField
              label="Call Focus & Topics"
              htmlFor="callNotes"
            >
              <Textarea
                id="callNotes"
                placeholder="e.g. I'd like feedback on my week 1 career audit, resume positioning, and advice on targeting AI engineer roles."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
            </FormField>
            <p className="text-[11px] text-muted-foreground">
              What would you like your mentor to review or prepare for this session?
            </p>
          </div>

          <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1 border border-border/60">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="size-3.5 text-primary" />
              <span>How it works:</span>
            </div>
            <p>
              Once you submit this request, your mentor receives it immediately. They will confirm the time and generate a <strong>Google Meet</strong> link that will be displayed right on your session page.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!preferredDate || requestMutation.isPending}
              className="rounded-xl text-xs font-semibold gap-1.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95"
            >
              {requestMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span>Send Call Request</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
