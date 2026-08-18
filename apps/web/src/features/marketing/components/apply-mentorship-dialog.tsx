"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mentorshipService } from "@/services/mentorship.service";
import { toast } from "sonner";

export function ApplyMentorshipDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [timeline, setTimeline] = useState("");

  const isValid = name.trim().length > 0 && email.trim().length > 0 && email.includes("@");

  const submit = useMutation({
    mutationFn: () =>
      mentorshipService.createApplication({
        name: name.trim(),
        email: email.trim(),
        currentRole: currentRole.trim(),
        targetRole: targetRole.trim(),
        timeline: timeline.trim(),
      }),
    onSuccess: () => {
      toast.success("Application submitted successfully. We'll be in touch soon!");
      setOpen(false);
      setName("");
      setEmail("");
      setCurrentRole("");
      setTargetRole("");
      setTimeline("");
    },
    onError: () => {
      toast.error("Failed to submit application. Please try again.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger nativeButton={true} render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for Mentorship</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Fill out the intake form. Tell us where you are, what you're targeting, and what your timeline looks like.
          </p>

          <FormField label="Full Name *" htmlFor="name">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </FormField>

          <FormField label="Email *" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </FormField>

          <FormField label="Current Role / Situation" htmlFor="currentRole">
            <Input
              id="currentRole"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. SDE-1 at Amazon, 1 year experience"
            />
          </FormField>

          <FormField label="Target Role" htmlFor="targetRole">
            <Input
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-2 at Microsoft"
            />
          </FormField>

          <FormField label="Timeline" htmlFor="timeline">
            <Textarea
              id="timeline"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="When are you looking to switch? E.g. Actively interviewing, or looking to switch in 6 months."
              className="resize-none"
              rows={3}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => submit.mutate()}
            disabled={!isValid || submit.isPending}
          >
            {submit.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
