"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Video,
  FileText,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Target,
  Award,
  CalendarClock,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProMentorshipTrack, PersonalMentorshipSession } from "@/services/mentorship.service";

interface PersonalTrackViewProps {
  track: ProMentorshipTrack;
  canManage?: boolean;
  baseHref?: string;
}

export function PersonalTrackView({
  track,
  canManage = false,
  baseHref = "/student/mentorship/sessions",
}: PersonalTrackViewProps) {
  const sessions = track.sessions || [];
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const totalCount = sessions.length || 12;
  const completedCount = completedSessions.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Build 12-slot array mapped by weekNumber
  const slots = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    return sessions.find((s) => s.weekNumber === weekNum) || null;
  });

  // Aggregate deliverables & action items across all sessions
  const allDeliverables = sessions.flatMap((s) =>
    Array.isArray(s.deliverables)
      ? s.deliverables.map((d) => ({ ...d, weekNumber: s.weekNumber, sessionTitle: s.title }))
      : []
  );

  const allActionItems = sessions.flatMap((s) =>
    Array.isArray(s.actionItems) ? s.actionItems : []
  );
  const completedActionCount = allActionItems.filter((i) => i.completed).length;

  const meta = [
    {
      icon: ShieldCheck,
      label: track.seniorMentor
        ? `Mentor: ${track.seniorMentor.firstName} ${track.seniorMentor.lastName || ""}`
        : "Mentor Assignment Pending",
    },
    {
      icon: BookOpen,
      label: `${completedCount}/${totalCount} 1:1 sessions completed`,
    },
    {
      icon: Target,
      label: track.targetRole
        ? `Target: ${track.targetRole}${track.targetCompany ? ` @ ${track.targetCompany}` : ""}`
        : "12-Week Career Sprint",
    },
    {
      icon: CalendarDays,
      label: track.status === "active" ? "Active Mentorship" : track.status,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Cohort-style Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-6 shadow-xs ring-1 ring-foreground/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground tracking-wider uppercase shadow-2xs">
                Pro 1:1 Track
              </span>
              <Badge variant="outline" className="text-[11px] font-medium border-border/80">
                {percentComplete === 100 ? "Completed" : "In progress"}
              </Badge>
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              12-Week Personal Mentorship
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Your personalized 1-on-1 study plan, specialist interview drills, portfolio reviews,
              and executive negotiation coaching.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
              {meta.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1"
                >
                  <item.icon className="size-3.5 shrink-0 text-foreground/70" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 12-Week Progress Ribbon (Session Tracker) */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3 ring-1 ring-foreground/5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
              12-Week Sprint Progress
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
              {completedCount} / 12 Completed ({percentComplete}%)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-xs bg-primary" /> Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-xs border border-primary bg-primary/10" /> Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-xs border border-border bg-muted/30" /> Upcoming
            </span>
          </div>
        </div>

        {/* 12 Slots Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-xs">
          {slots.map((session, idx) => {
            const week = idx + 1;
            const isCompleted = session?.status === "completed";
            const isScheduled = session?.status === "scheduled";
            const isRequested = session?.status === "requested";
            const sessionHref = session ? `${baseHref}/${session.id}` : "#";

            return (
              <Link
                key={week}
                href={sessionHref}
                className={cn(
                  "group relative flex flex-col justify-between rounded-lg p-2.5 text-left transition-all min-h-[66px] border",
                  isCompleted && "bg-primary text-primary-foreground border-primary shadow-xs hover:bg-primary/95",
                  isScheduled && "border-2 border-primary bg-primary/10 text-foreground ring-1 ring-primary/20 hover:bg-primary/15",
                  isRequested && "bg-muted/60 border-border text-foreground hover:bg-muted/80",
                  (!session || session.status === "not_scheduled") && "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn("font-mono text-[10px] font-bold", isCompleted ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    W{String(week).padStart(2, "0")}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="size-3 text-primary-foreground" />
                  ) : isScheduled ? (
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  ) : null}
                </div>
                <p className={cn("text-[11px] font-semibold leading-tight line-clamp-2 mt-1", isCompleted ? "text-primary-foreground" : "text-foreground")}>
                  {session?.title || `Week ${week}`}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Cohort-style Tabs */}
      <Tabs defaultValue="learnings">
        <TabsList variant="line">
          <TabsTrigger value="learnings">Your 1:1 Sessions</TabsTrigger>
          <TabsTrigger value="progress">Progress & Milestones</TabsTrigger>
        </TabsList>

        {/* Tab 1: 1:1 Sessions Grid (Matching ClassCard style with direct page links) */}
        <TabsContent value="learnings" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => {
              const isCompleted = session.status === "completed";
              const isScheduled = session.status === "scheduled";
              const isCancelled = session.status === "cancelled";
              const hasDeliverables =
                Array.isArray(session.deliverables) && session.deliverables.length > 0;
              const hasFeedback = Boolean(session.mentorFeedback);
              const hasCall = Boolean(session.meetingUrl);
              const sessionHref = `${baseHref}/${session.id}`;

              return (
                <Link
                  key={session.id}
                  href={sessionHref}
                  className={cn(
                    "group flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 transition-all hover:shadow-md",
                    isCancelled
                      ? "opacity-70 ring-destructive/25"
                      : isCompleted
                        ? "ring-primary/25"
                        : isScheduled
                          ? "ring-blue-500/25 dark:ring-blue-500/20"
                          : "ring-foreground/10 hover:ring-foreground/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex w-fit items-center gap-1 text-[11px] font-medium uppercase tracking-wider",
                        isCancelled
                          ? "text-destructive"
                          : isCompleted
                            ? "text-primary"
                            : isScheduled
                              ? "text-blue-600 dark:text-blue-400"
                              : "hidden",
                      )}
                    >
                      {isCancelled ? (
                        "Cancelled"
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          Completed
                        </>
                      ) : isScheduled ? (
                        <>
                          <CalendarDays className="size-3.5" />
                          Scheduled
                        </>
                      ) : null}
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                          Week {session.weekNumber}
                        </span>

                        {isCompleted ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-medium">
                            Completed
                          </Badge>
                        ) : isScheduled ? (
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 text-[10px] font-medium"
                          >
                            Scheduled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Not scheduled
                          </Badge>
                        )}
                      </div>

                      <p
                        className={cn(
                          "font-heading text-base leading-snug font-medium",
                          isCompleted ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {session.title}
                      </p>

                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {session.format}
                      </p>

                      {session.scheduledAt && (
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <CalendarDays className="size-3.5 text-primary shrink-0" />
                            {formatDate(session.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary shrink-0" />
                            {formatTime(session.scheduledAt)}
                          </span>
                        </p>
                      )}
                    </div>

                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Card bottom bar matching ClassCard */}
                  <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border/60 pt-3 text-xs">
                    <span
                      className={cn(
                        "flex items-center gap-1.5",
                        hasCall ? "text-primary font-medium" : "text-muted-foreground/50",
                      )}
                    >
                      <Video className="size-3.5" />
                      1:1 Call
                    </span>

                    <span
                      className={cn(
                        "flex items-center gap-1.5",
                        hasDeliverables ? "text-primary font-medium" : "text-muted-foreground/50",
                      )}
                    >
                      <FileText className="size-3.5" />
                      Deliverables
                    </span>

                    <span
                      className={cn(
                        "flex items-center gap-1.5",
                        hasFeedback
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-muted-foreground/50",
                      )}
                    >
                      <MessageSquare className="size-3.5" />
                      Feedback
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 2: Progress & Milestones */}
        <TabsContent value="progress" className="mt-6">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col justify-center gap-3 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Sessions Delivered</span>
                  <Award className="size-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">{completedCount}</span>
                  <span className="text-xs text-muted-foreground">/ {totalCount} ({percentComplete}%)</span>
                </div>
                <Progress value={percentComplete} />
              </div>

              <div className="flex flex-col justify-center gap-3 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Deliverables Produced</span>
                  <FileText className="size-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">{allDeliverables.length}</span>
                  <span className="text-xs text-muted-foreground">Documents & Artifacts</span>
                </div>
                <p className="text-[11px] text-muted-foreground">PRDs, technical specs, resumes</p>
              </div>

              <div className="flex flex-col justify-center gap-3 rounded-xl bg-card p-5 shadow-xs ring-1 ring-foreground/10 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Action Tasks</span>
                  <CheckCircle2 className="size-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">{completedActionCount}</span>
                  <span className="text-xs text-muted-foreground">/ {allActionItems.length} Completed</span>
                </div>
                <Progress
                  value={
                    allActionItems.length > 0
                      ? Math.round((completedActionCount / allActionItems.length) * 100)
                      : 0
                  }
                />
              </div>
            </div>

            {/* Deliverables Vault Section (If any) */}
            {allDeliverables.length > 0 && (
              <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Deliverables & Documents Vault
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {allDeliverables.length} Items Across Sessions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allDeliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between rounded-lg border border-border/70 bg-muted/20 p-3 text-xs hover:bg-muted/40 transition-colors gap-2"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          Week {item.weekNumber}
                        </span>
                        <p className="font-semibold text-foreground truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.sessionTitle}</p>
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 rounded-md hover:bg-background text-primary"
                          title="Open deliverable"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones Breakdown */}
            <div className="flex flex-col gap-3">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Roadmap Milestones
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase">Phase 1 (Weeks 1–4)</span>
                    <Badge variant="outline" className="text-[10px]">Positioning</Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Audit, Resume & Portfolio</p>
                  <p className="text-xs text-muted-foreground">Kickoff, LinkedIn overhaul, portfolio deep dive, narrative.</p>
                </div>

                <div className="rounded-xl border bg-card p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase">Phase 2 (Weeks 5–8)</span>
                    <Badge variant="outline" className="text-[10px]">Interview Prep</Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Domain Prep & Mock #1</p>
                  <p className="text-xs text-muted-foreground">Application strategy, behavioural mock with written feedback, midpoint sync.</p>
                </div>

                <div className="rounded-xl border bg-card p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase">Phase 3 (Weeks 9–12)</span>
                    <Badge variant="outline" className="text-[10px]">Placement</Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground">Technical Mock & Offers</p>
                  <p className="text-xs text-muted-foreground">Technical scenarios, domain mock #2, offer negotiation, 90-day plan.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
