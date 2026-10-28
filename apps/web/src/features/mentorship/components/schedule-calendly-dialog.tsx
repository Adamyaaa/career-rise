"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { PersonalMentorshipSession } from "@/services/mentorship.service";

interface ScheduleCalendlyDialogProps {
  session: PersonalMentorshipSession;
  mentorName?: string;
  calendlyUrl?: string | null;
  studentName?: string;
  studentEmail?: string;
  children?: React.ReactNode;
}

export function ScheduleCalendlyDialog({
  session,
  mentorName,
  calendlyUrl,
  studentName,
  studentEmail,
  children,
}: ScheduleCalendlyDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Listen for Calendly event message
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.event === "calendly.event_scheduled") {
        toast.success("1:1 Mentorship session scheduled successfully!");
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: ["mentorship-session", session.id] });
        queryClient.invalidateQueries({ queryKey: ["my-pro-track"] });
        queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
        queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [session.id, queryClient]);

  const activeUrl = calendlyUrl || process.env.NEXT_PUBLIC_CALENDLY_SCHEDULING_URL || "";

  if (!activeUrl) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="rounded-xl gap-2 text-xs text-muted-foreground opacity-70"
        title="Mentor has not configured their Calendly booking link yet"
      >
        <CalendarDays className="size-3.5" />
        <span>Scheduling Pending Mentor Setup</span>
      </Button>
    );
  }

  // Build target booking URL with tracking & prefill parameters
  let targetUrl: string = activeUrl;
  try {
    const url = new URL(
      activeUrl.startsWith("http") ? activeUrl : `https://${activeUrl}`,
    );
    if (studentName) url.searchParams.set("name", studentName);
    if (studentEmail) url.searchParams.set("email", studentEmail);
    // Embed tracking codes so webhook easily matches session
    url.searchParams.set("utm_campaign", session.id);
    url.searchParams.set("utm_term", session.id);
    url.searchParams.set("utm_content", session.id);
    url.searchParams.set("a1", session.id);
    url.searchParams.set("hide_landing_page_details", "1");
    url.searchParams.set("hide_gdpr_banner", "1");
    targetUrl = url.toString();
  } catch {
    targetUrl = activeUrl;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger nativeButton={true} render={children as React.ReactElement}>
        <Button className="rounded-xl px-4 font-semibold gap-2 shadow-xs text-xs">
          <CalendarDays className="size-3.5" />
          <span>Book Session via Calendly</span>
          <Sparkles className="size-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 sm:p-5 pb-2 border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Schedule Week {session.weekNumber}: {session.title}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select a time slot with {mentorName ? `mentor ${mentorName}` : "your mentor"}.
              </p>
            </div>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 shrink-0 mr-6"
            >
              <span>Open in new tab</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </DialogHeader>

        <div className="w-full h-[620px] bg-muted/10 relative">
          <iframe
            src={targetUrl}
            title={`Schedule 1:1 with ${mentorName || "mentor"}`}
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay; encrypted-media"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
