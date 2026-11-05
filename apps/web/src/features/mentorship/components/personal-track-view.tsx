"use client";

import { useState } from "react";
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
  ArrowLeft,
  ArrowRight,
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

  // Find next upcoming/unscheduled session to select by default, or week 1
  const defaultWeek =
    sessions.find((s) => s.status === "scheduled" || s.status === "requested" || s.status === "not_scheduled")
      ?.weekNumber || 1;
  const [selectedWeek, setSelectedWeek] = useState<number>(defaultWeek);

  // Build 12-slot array mapped by weekNumber
  const slots = Array.from({ length: 12 }, (_, i) => {
    const weekNum = i + 1;
    return sessions.find((s) => s.weekNumber === weekNum) || null;
  });

  const activeSession =
    sessions.find((s) => s.weekNumber === selectedWeek) ||
    slots[selectedWeek - 1] || {
      id: "",
      weekNumber: selectedWeek,
      title: `Week ${selectedWeek} Mentorship Session`,
      format: "1:1 with Senior Mentor, 75 min",
      status: "not_scheduled",
      scheduledAt: null,
      meetingUrl: null,
      mentorFeedback: null,
      deliverables: [],
      actionItems: [],
    };

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

  const isMenteeView = canManage && Boolean(track.student);
  const studentFullName =
    [track.student?.firstName, track.student?.lastName].filter(Boolean).join(" ") ||
    track.student?.email ||
    "Student";

  const meta = [
    ...(isMenteeView
      ? [
          {
            icon: ShieldCheck,
            label: `Mentee: ${studentFullName} (${track.student?.email || ""})`,
          },
        ]
      : []),
    {
      icon: ShieldCheck,
      label: track.seniorMentor
        ? `Mentor: ${track.seniorMentor.firstName} ${track.seniorMentor.lastName || ""}`
        : "Mentor Assignment Pending",
    },
    {
      icon: BookOpen,
      label: `${completedCount}/${totalCount} 1:1 sessions completed (${percentComplete}%)`,
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
                {isMenteeView ? "Mentee Dossier" : "Pro 1:1 Track"}
              </span>
              <Badge variant="outline" className="text-[11px] font-medium border-border/80">
                {percentComplete === 100 ? "Completed" : "In progress"}
              </Badge>
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isMenteeView ? `${studentFullName}'s 12-Week Roadmap` : "12-Week Personal Mentorship"}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {isMenteeView
                ? `Personalized 1-on-1 study plan, weekly milestone tracking, deliverables, and interview coaching for ${studentFullName}.`
                : "Your personalized 1-on-1 study plan, specialist interview drills, portfolio reviews, and executive negotiation coaching."}
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

            const isSelected = selectedWeek === week;

            return (
              <button
                key={week}
                type="button"
                onClick={() => setSelectedWeek(week)}
                className={cn(
                  "group relative flex flex-col justify-between rounded-lg p-2.5 text-left transition-all min-h-[66px] border cursor-pointer",
                  isSelected && "ring-2 ring-primary ring-offset-1 dark:ring-offset-background",
                  isCompleted && "bg-primary text-primary-foreground border-primary shadow-xs hover:bg-primary/95",
                  isScheduled && "border-2 border-primary bg-primary/10 text-foreground hover:bg-primary/15",
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
              </button>
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

        {/* Tab 1: Week-by-Week (Week 1, 2, 3...) Interactive Switcher */}
        <TabsContent value="learnings" className="mt-6 space-y-5">
          {/* Week Pills Bar: Week 1, Week 2, Week 3 ... Week 12 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                Select Week
              </span>
              <span>
                Showing Week <strong className="text-primary font-bold">{selectedWeek}</strong> of 12
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((weekNum) => {
                const s = slots[weekNum - 1];
                const isSelected = selectedWeek === weekNum;
                const isCompleted = s?.status === "completed";
                const isScheduled = s?.status === "scheduled";

                return (
                  <button
                    key={weekNum}
                    type="button"
                    onClick={() => setSelectedWeek(weekNum)}
                    className={cn(
                      "shrink-0 px-3.5 py-2 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                        : "bg-card border-border text-foreground hover:border-primary/60 hover:bg-muted/30",
                    )}
                  >
                    <span>Week {weekNum}</span>
                    {isCompleted && (
                      <CheckCircle2 className={cn("size-3", isSelected ? "text-primary-foreground" : "text-emerald-600")} />
                    )}
                    {isScheduled && !isCompleted && (
                      <span className={cn("size-1.5 rounded-full", isSelected ? "bg-primary-foreground" : "bg-primary animate-pulse")} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focused Active Session Card */}
          {(() => {
            const isCompleted = activeSession.status === "completed";
            const isScheduled = activeSession.status === "scheduled";
            const isRequested = activeSession.status === "requested";
            const sessionHref = activeSession.id ? `${baseHref}/${activeSession.id}` : "#";
            const deliverablesCount = Array.isArray(activeSession.deliverables) ? activeSession.deliverables.length : 0;
            const actionItemsCount = Array.isArray(activeSession.actionItems) ? activeSession.actionItems.length : 0;

            return (
              <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs ring-1 ring-foreground/5 space-y-6">
                {/* Header & Title */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground uppercase tracking-wider">
                        Week {activeSession.weekNumber}
                      </span>

                      {isCompleted ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold gap-1 rounded-md">
                          <CheckCircle2 className="size-3" /> Completed
                        </Badge>
                      ) : isScheduled ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 text-xs font-semibold gap-1 rounded-md"
                        >
                          <CalendarDays className="size-3" /> Scheduled
                        </Badge>
                      ) : isRequested ? (
                        <Badge
                          variant="secondary"
                          className="bg-muted text-foreground border-border text-xs font-semibold gap-1 rounded-md"
                        >
                          <Clock className="size-3 text-muted-foreground" /> Call Requested
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground rounded-md">
                          Not scheduled
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{activeSession.format || "1:1 with Senior Mentor, 75 min"}</span>
                    </div>

                    <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {activeSession.title}
                    </h2>

                    {activeSession.scheduledAt ? (
                      <p className="flex items-center gap-2 text-xs font-semibold text-foreground pt-1">
                        <CalendarDays className="size-4 text-primary" />
                        <span>{formatDate(activeSession.scheduledAt)} at {formatTime(activeSession.scheduledAt)}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground pt-1">
                        Live 75-minute one-on-one session with your mentor. Click below to book or confirm your slot.
                      </p>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    {activeSession.meetingUrl ? (
                      <Button
                        render={<a href={activeSession.meetingUrl} target="_blank" rel="noopener noreferrer" />}
                        className="rounded-lg font-semibold gap-2 shadow-xs bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs px-4 py-2"
                      >
                        <Video className="size-4" />
                        <span>Join Google Meet</span>
                        <ExternalLink className="size-3.5 opacity-70" />
                      </Button>
                    ) : activeSession.id ? (
                      <Button
                        render={<Link href={sessionHref} />}
                        className="rounded-lg font-semibold gap-2 shadow-xs bg-primary text-primary-foreground hover:bg-primary/95 text-xs px-4 py-2"
                      >
                        <CalendarDays className="size-4" />
                        <span>{isRequested ? "Review / Change Slot" : "Open Session & Book Slot"}</span>
                        <ChevronRight className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* 3-Column Meta Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Schedule Details
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {activeSession.scheduledAt
                        ? `${formatDate(activeSession.scheduledAt)} · ${formatTime(activeSession.scheduledAt)}`
                        : "To be finalized with mentor"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">75-minute live mentorship deep-dive</p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Assigned Mentor
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {track.seniorMentor
                        ? `${track.seniorMentor.firstName} ${track.seniorMentor.lastName || ""}`
                        : "Senior Mentor"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Dedicated 1:1 coaching & review</p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Deliverables & Tasks
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {deliverablesCount} Deliverables · {actionItemsCount} Tasks
                    </p>
                    <p className="text-[11px] text-muted-foreground">Reviewed live on the call</p>
                  </div>
                </div>

                {/* Mentor Feedback Preview (If completed) */}
                {activeSession.mentorFeedback && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1.5 text-xs">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-primary" />
                      <span>Mentor Written Takeaways:</span>
                    </p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {activeSession.mentorFeedback}
                    </p>
                  </div>
                )}

                {/* Previous / Next Week Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedWeek <= 1}
                    onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
                    className="gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Previous Week</span>
                  </Button>

                  <span className="text-muted-foreground font-mono text-[11px]">
                    Week {selectedWeek} of 12
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={selectedWeek >= 12}
                    onClick={() => setSelectedWeek((w) => Math.min(12, w + 1))}
                    className="gap-1.5 text-xs font-semibold text-primary hover:text-primary/90 disabled:opacity-30"
                  >
                    <span>Next Week</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })()}
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
