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
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs ring-1 ring-foreground/5">
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

      {/* 2. Cohort-style Tabs */}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-center gap-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-xs ring-1 ring-foreground/10">
                <p className="font-heading text-lg font-medium text-foreground">Your 1:1 Progress</p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Award className="size-4 text-primary" /> Sessions Completed
                      </span>
                      <span className="font-semibold text-foreground">
                        {completedCount} / {totalCount} ({percentComplete}%)
                      </span>
                    </div>
                    <Progress value={percentComplete} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-heading text-sm font-medium text-foreground">
                    <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
                    12-Week Roadmap Pace
                  </p>
                  <span className="text-sm font-medium text-muted-foreground">
                    {totalCount - completedCount} Left
                  </span>
                </div>
                <Progress value={percentComplete} />
                <p className="text-xs text-muted-foreground">
                  {completedCount} of {totalCount} personal sessions delivered. Keep completing your action items
                  after each specialist call.
                </p>
              </div>
            </div>

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
