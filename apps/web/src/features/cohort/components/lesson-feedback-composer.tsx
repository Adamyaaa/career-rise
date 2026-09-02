"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { feedbackService } from "@/services/learning.service";
import { toast } from "sonner";

// Write-only by design: the student sends feedback and never sees it again, so there's
// nothing to list here — just a trigger and a compose box.
export function LessonFeedbackComposer({ lessonId, lessonTitle, buttonLabel = "Feedback" }: { lessonId: string; lessonTitle: string; buttonLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [heaviness, setHeaviness] = useState("");
  const [upcomingTopics, setUpcomingTopics] = useState("");

  const send = useMutation({
    mutationFn: () => {
      const parts = [];
      if (feedback.trim()) parts.push(`**Feedback on this class:**\n${feedback}`);
      if (suggestions.trim()) parts.push(`**Suggestions for improvement:**\n${suggestions}`);
      if (heaviness) parts.push(`**Do you think classroom project that was given is very heavy?**\n${heaviness}`);
      if (upcomingTopics.trim()) parts.push(`**What more topic do you want to take in upcoming sessions:**\n${upcomingTopics}`);
      
      const combinedBody = parts.length > 0 ? parts.join("\n\n") : "No feedback provided.";
      
      return feedbackService.post(lessonId, combinedBody);
    },
    onSuccess: () => {
      setFeedback("");
      setSuggestions("");
      setHeaviness("");
      setUpcomingTopics("");
      setOpen(false);
      toast.success("Feedback sent — only your mentor can see it");
      // Page should probably be revalidated to show completion
      window.location.reload();
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't send that — try again"),
  });

  const isFormValid = feedback.trim() || suggestions.trim() || heaviness || upcomingTopics.trim();

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
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback on this class</DialogTitle>
            <DialogDescription>
              {lessonTitle} — goes privately to your mentor. You won&apos;t see it again once sent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-base">Feedback on this class</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Your answer"
                rows={2}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions" className="text-base">Suggestions for improvement</Label>
              <Textarea
                id="suggestions"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Your answer"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Do you think classroom project that was given is very heavy?</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="heaviness" 
                    value="Yes, it is very heavy" 
                    checked={heaviness === "Yes, it is very heavy"} 
                    onChange={(e) => setHeaviness(e.target.value)} 
                    className="size-4 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm font-normal">Yes, it is very heavy</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="heaviness" 
                    value="No, it is very easy." 
                    checked={heaviness === "No, it is very easy."} 
                    onChange={(e) => setHeaviness(e.target.value)} 
                    className="size-4 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm font-normal">No, it is very easy.</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="heaviness" 
                    value="Yes, but will try to do whatever is feasible and continue to complete." 
                    checked={heaviness === "Yes, but will try to do whatever is feasible and continue to complete."} 
                    onChange={(e) => setHeaviness(e.target.value)} 
                    className="size-4 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm font-normal">Yes, but will try to do whatever is feasible and continue to complete.</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upcomingTopics" className="text-base">What more topic do you want to take in upcoming sessions</Label>
              <Textarea
                id="upcomingTopics"
                value={upcomingTopics}
                onChange={(e) => setUpcomingTopics(e.target.value)}
                placeholder="Your answer"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={() => send.mutate()} disabled={send.isPending || !isFormValid}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
