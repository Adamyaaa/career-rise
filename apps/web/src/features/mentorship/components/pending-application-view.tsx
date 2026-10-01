"use client";

import { Clock, CheckCircle, Mail, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MentorshipApplication } from "@/services/mentorship.service";

export function PendingApplicationView({
  application,
}: {
  application?: MentorshipApplication | null;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <div className="rounded-2xl border bg-card p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock className="size-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5">
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
              Application Under Review
            </Badge>
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Your Pro Mentorship Application is Submitted
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Our admissions team is currently reviewing your profile and matching you with an
            appropriate Senior Engineering Mentor. Once approved, your 12-week personal tracker will
            activate here automatically.
          </p>
        </div>

        {application && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border bg-muted/30 p-4 text-left text-sm space-y-2.5">
            <div className="flex justify-between border-b pb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span>Application Details</span>
              <span>
                {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
                  new Date(application.createdAt),
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Target Role:</span>
              <span className="font-medium text-foreground">{application.targetRole || "—"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Current Situation:</span>
              <span className="font-medium text-foreground">{application.currentRole || "—"}</span>
            </div>
            {application.timeline && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Timeline:</span>
                <span className="font-medium text-foreground">{application.timeline}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-t">
          <span className="flex items-center gap-1.5">
            <Mail className="size-3.5 text-primary" />
            Notification will be sent to your registered email
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            1:1 Mentor Matching in progress
          </span>
        </div>
      </div>
    </div>
  );
}
