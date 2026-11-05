"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Users,
  Eye,
  Clock,
  Video,
  ShieldCheck,
  Plus,
  X,
  RotateCcw,
  CheckCircle2,
  CalendarDays,
  FileText,
  CheckSquare,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  AlertCircle,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  mentorshipService,
  type ProMentorshipTrack,
  type StudentUpdateItem,
} from "@/services/mentorship.service";
import { PersonalTrackView } from "./personal-track-view";
import { formatDate, formatTime } from "@/lib/format";
import { toast } from "sonner";

const DEFAULT_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
  "07:30 PM",
];

export function MentorMentorshipView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("updates");

  // Track Inspection Modal state
  const [selectedTrack, setSelectedTrack] = useState<ProMentorshipTrack | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Settings toggle
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [googleMeetUrl, setGoogleMeetUrl] = useState("");
  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [newSlotInput, setNewSlotInput] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Filter states
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>("all");
  const [updateTypeFilter, setUpdateTypeFilter] = useState<string>("all");
  const [searchMenteeQuery, setSearchMenteeQuery] = useState("");

  // Queries
  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ["mentor-mentorship-dashboard"],
    queryFn: () => mentorshipService.getMentorDashboard(),
  });

  const { data: settingsData } = useQuery({
    queryKey: ["mentor-settings"],
    queryFn: () => mentorshipService.getMentorSettings(),
  });

  useEffect(() => {
    if (settingsData && !hasInitialized) {
      setGoogleMeetUrl(settingsData.googleMeetUrl || "");
      if (Array.isArray(settingsData.availableSlots) && settingsData.availableSlots.length > 0) {
        setSlots(settingsData.availableSlots);
      }
      setHasInitialized(true);
    }
  }, [settingsData, hasInitialized]);

  const updateSettingsMutation = useMutation({
    mutationFn: (payload: { googleMeetUrl: string; availableSlots: string[] }) =>
      mentorshipService.updateMentorSettings(payload),
    onSuccess: () => {
      toast.success("1:1 Google Meet room and availability slots saved!");
      queryClient.invalidateQueries({ queryKey: ["mentor-settings"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-mentorship-dashboard"] });
      setSettingsOpen(false);
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const openTrack = (track: ProMentorshipTrack) => {
    setSelectedTrack(track);
    setDialogOpen(true);
  };

  const handleAddSlot = () => {
    const trimmed = newSlotInput.trim();
    if (!trimmed) return;
    if (slots.includes(trimmed)) {
      toast.info("Slot already added");
      return;
    }
    setSlots([...slots, trimmed]);
    setNewSlotInput("");
  };

  const tracks = dashboard?.tracks || [];
  const summary = dashboard?.summary || {
    totalMentees: 0,
    pendingRequestsCount: 0,
    upcomingSessionsCount: 0,
    completedSessionsCount: 0,
    totalDeliverablesCount: 0,
    actionItemsTotal: 0,
    actionItemsCompleted: 0,
    openDoubtsCount: 0,
  };

  // Filter updates
  const filteredUpdates = useMemo(() => {
    if (!dashboard?.recentUpdates) return [];
    return dashboard.recentUpdates.filter((item) => {
      if (selectedStudentFilter !== "all" && item.studentId !== selectedStudentFilter) {
        return false;
      }
      if (updateTypeFilter !== "all" && item.type !== updateTypeFilter) {
        return false;
      }
      return true;
    });
  }, [dashboard?.recentUpdates, selectedStudentFilter, updateTypeFilter]);

  // Filter mentees
  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    if (!searchMenteeQuery.trim()) return tracks;
    const q = searchMenteeQuery.toLowerCase();
    return tracks.filter((t) => {
      const name = `${t.student?.firstName || ""} ${t.student?.lastName || ""}`.toLowerCase();
      const email = (t.student?.email || "").toLowerCase();
      const role = (t.targetRole || "").toLowerCase();
      const company = (t.targetCompany || "").toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q) || company.includes(q);
    });
  }, [tracks, searchMenteeQuery]);

  // Collect all deliverables across tracks
  const allDeliverables = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      url: string;
      type?: string;
      submittedAt?: string;
      weekNumber: number;
      sessionTitle: string;
      sessionId: string;
      trackId: string;
      studentName: string;
      studentEmail: string;
      studentId: string;
    }> = [];

    tracks.forEach((track) => {
      const studentName =
        [track.student?.firstName, track.student?.lastName].filter(Boolean).join(" ") ||
        track.student?.email ||
        "Student";
      track.sessions?.forEach((s) => {
        if (Array.isArray(s.deliverables)) {
          s.deliverables.forEach((d: any, idx: number) => {
            if (d && (d.title || d.url)) {
              list.push({
                id: `${s.id}-${idx}`,
                title: d.title || "Project Deliverable",
                url: d.url,
                type: d.type,
                submittedAt: d.submittedAt,
                weekNumber: s.weekNumber,
                sessionTitle: s.title,
                sessionId: s.id,
                trackId: track.id,
                studentName,
                studentEmail: track.student?.email || "",
                studentId: track.studentId,
              });
            }
          });
        }
      });
    });

    return list;
  }, [tracks]);

  if (loadingDashboard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mentor KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Mentees */}
        <div className="p-4 rounded-2xl border bg-card shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Mentees
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">{summary.totalMentees}</p>
          </div>
        </div>

        {/* Pending Session Requests */}
        <div
          className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3 ${
            summary.pendingRequestsCount > 0
              ? "bg-amber-500/5 border-amber-500/30"
              : "bg-card"
          }`}
        >
          <div
            className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
              summary.pendingRequestsCount > 0
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <CalendarClock className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Session Requests
              </p>
              {summary.pendingRequestsCount > 0 && (
                <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {summary.pendingRequestsCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">pending review</span>
            </p>
          </div>
        </div>

        {/* Deliverables Submitted */}
        <div className="p-4 rounded-2xl border bg-card shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Deliverables Handed In
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {summary.totalDeliverablesCount}
            </p>
          </div>
        </div>

        {/* Doubts / Questions */}
        <div className="p-4 rounded-2xl border bg-card shadow-xs flex items-center gap-3">
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Open Doubts
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {summary.openDoubtsCount}{" "}
              <Link
                href="/mentor/doubts"
                className="text-xs font-medium text-primary hover:underline ml-1"
              >
                View all &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Standing Google Meet & Availability Bar */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Video className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Mentor 1:1 Google Meet &amp; Slot Configuration
                </span>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  {googleMeetUrl ? "Meet Active" : "No Meet Link"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {googleMeetUrl
                  ? `Standing room set (${googleMeetUrl.slice(0, 32)}...) • ${slots.length} available slots`
                  : "Set your standing Google Meet link and available session time slots"}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1 text-muted-foreground"
          >
            {settingsOpen ? (
              <>
                Hide Settings <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                Configure <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        </div>

        {settingsOpen && (
          <div className="p-5 border-t border-border/60 bg-muted/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Google Meet Link */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Video className="size-3.5 text-muted-foreground" />
                  Standing Google Meet Room Link
                </label>
                <Input
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={googleMeetUrl}
                  onChange={(e) => setGoogleMeetUrl(e.target.value)}
                  className="text-xs h-9"
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  When you confirm a student&apos;s 1:1 request, this link is automatically attached to their session.
                </p>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    Available Time Slots (IST)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSlots(DEFAULT_SLOTS)}
                    className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-border/80 bg-background">
                  {slots.map((slot, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      {slot}
                      <button
                        type="button"
                        onClick={() => setSlots(slots.filter((_, i) => i !== index))}
                        className="text-muted-foreground hover:text-destructive ml-0.5"
                        aria-label={`Remove slot ${slot}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. 03:00 PM"
                    value={newSlotInput}
                    onChange={(e) => setNewSlotInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSlot();
                      }
                    }}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddSlot}
                    className="text-xs h-8 px-3 shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/50">
              <Button
                size="sm"
                onClick={() =>
                  updateSettingsMutation.mutate({
                    googleMeetUrl: googleMeetUrl.trim(),
                    availableSlots: slots,
                  })
                }
                disabled={updateSettingsMutation.isPending}
                className="text-xs font-semibold h-9 px-4"
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Mentorship Hub Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-1">
          <TabsList variant="line">
            <TabsTrigger value="updates" className="gap-1.5">
              <Sparkles className="size-3.5" />
              Student Updates Feed ({dashboard?.recentUpdates?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="mentees" className="gap-1.5">
              <Users className="size-3.5" />
              My Mentees ({tracks.length})
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1.5">
              <CalendarDays className="size-3.5" />
              Sessions &amp; Calls ({dashboard?.upcomingSessions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="gap-1.5">
              <FileText className="size-3.5" />
              Deliverables ({allDeliverables.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Student Updates & Activity Feed */}
        <TabsContent value="updates" className="mt-6 space-y-4">
          {/* Feed Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border bg-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                <SlidersHorizontal className="size-3.5" /> Filter by:
              </span>

              {/* Mentee filter */}
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Mentees ({tracks.length})</option>
                {tracks.map((t) => (
                  <option key={t.studentId} value={t.studentId}>
                    {t.student?.firstName} {t.student?.lastName || ""}
                  </option>
                ))}
              </select>

              {/* Type filter */}
              <select
                value={updateTypeFilter}
                onChange={(e) => setUpdateTypeFilter(e.target.value)}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Activity Types</option>
                <option value="session_request">Session Requests</option>
                <option value="deliverable">Deliverables</option>
                <option value="note">Student Notes</option>
                <option value="action_item">Completed Action Items</option>
                <option value="doubt">Doubt Questions</option>
              </select>
            </div>

            <div className="text-xs text-muted-foreground">
              Showing {filteredUpdates.length} updates
            </div>
          </div>

          {filteredUpdates.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border bg-card space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Sparkles className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground">No updates found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {selectedStudentFilter !== "all" || updateTypeFilter !== "all"
                  ? "No updates match the selected filter criteria."
                  : "As your assigned students request calls, submit deliverables, and complete roadmap items, their activity will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUpdates.map((item) => {
                const track = tracks.find((t) => t.studentId === item.studentId);
                const isSessionRequest = item.type === "session_request";
                const isDeliverable = item.type === "deliverable";
                const isNote = item.type === "note";
                const isActionItem = item.type === "action_item";
                const isDoubt = item.type === "doubt";

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border bg-card hover:bg-muted/20 transition-colors shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Icon type badge */}
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSessionRequest
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : isDeliverable
                            ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                            : isActionItem
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : isDoubt
                            ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                            : "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {isSessionRequest ? (
                          <CalendarClock className="size-5" />
                        ) : isDeliverable ? (
                          <FileText className="size-5" />
                        ) : isActionItem ? (
                          <CheckSquare className="size-5" />
                        ) : isDoubt ? (
                          <MessageSquare className="size-5" />
                        ) : (
                          <Sparkles className="size-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {item.studentName}
                          </span>
                          <span className="text-xs text-muted-foreground">• {item.studentEmail}</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                            {item.type.replace("_", " ")}
                          </Badge>
                          {item.weekNumber && (
                            <Badge variant="secondary" className="text-[10px]">
                              Week {item.weekNumber}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs font-medium text-foreground">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                            {item.description}
                          </p>
                        )}

                        <div className="text-[11px] text-muted-foreground pt-0.5">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }).format(new Date(item.timestamp))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {isDeliverable && item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-input text-xs font-semibold hover:bg-muted text-primary"
                        >
                          <ExternalLink className="size-3" /> View Deliverable
                        </a>
                      )}

                      {isDoubt && (
                        <Link
                          href="/mentor/doubts"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold"
                        >
                          <MessageSquare className="size-3" /> Reply in Chat
                        </Link>
                      )}

                      {track && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openTrack(track)}
                          className="rounded-xl text-xs gap-1"
                        >
                          <Eye className="size-3" /> Inspect Roadmap
                        </Button>
                      )}

                      {item.meta?.sessionId && track && (
                        <Link
                          href={`/mentor/mentorship/tracks/${track.id}/sessions/${item.meta.sessionId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                        >
                          Manage Call &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: My Mentees (Overview & Progress Cards) */}
        <TabsContent value="mentees" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search mentees by name, goal..."
                value={searchMenteeQuery}
                onChange={(e) => setSearchMenteeQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Total Mentees: {filteredTracks.length}
            </span>
          </div>

          {filteredTracks.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Users className="size-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">No Mentees Assigned</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                When an administrator matches a student to your mentorship profile, their 12-week
                progress record will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTracks.map((track) => {
                const completedSessions = track.sessions.filter((s) => s.status === "completed").length;
                const totalSessions = track.sessions.length || 12;
                const pct = Math.round((completedSessions / totalSessions) * 100);

                const nextSession =
                  track.sessions.find((s) => s.status === "requested") ||
                  track.sessions.find((s) => s.status === "scheduled") ||
                  track.sessions.find((s) => s.status === "not_scheduled");

                // Count deliverables
                const deliverablesCount = track.sessions.reduce(
                  (acc, s) => acc + (Array.isArray(s.deliverables) ? s.deliverables.length : 0),
                  0
                );

                // Count action items
                const actionItems = track.sessions.flatMap((s) =>
                  Array.isArray(s.actionItems) ? s.actionItems : []
                );
                const completedTasks = actionItems.filter((i) => i.completed).length;

                return (
                  <div
                    key={track.id}
                    className="rounded-2xl border bg-card p-5 shadow-xs space-y-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-base text-foreground">
                          {track.student?.firstName} {track.student?.lastName || ""}
                        </h3>
                        <p className="text-xs text-muted-foreground">{track.student?.email}</p>
                        {track.student?.phone && (
                          <p className="text-[11px] text-muted-foreground">{track.student.phone}</p>
                        )}
                      </div>

                      <Badge
                        variant="secondary"
                        className="text-[11px] bg-primary/10 text-primary border-primary/20"
                      >
                        {track.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Target goal */}
                    <div className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <TrendingUp className="size-3.5 text-primary" />
                        Target: {track.targetRole || "Career Transition"}
                      </div>
                      {track.targetCompany && (
                        <div className="text-muted-foreground">Company: {track.targetCompany}</div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">12-Week Roadmap</span>
                        <span className="font-bold text-foreground">
                          {completedSessions}/{totalSessions} Calls ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Quick Stats Pill Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                        <span className="text-muted-foreground text-[11px]">Deliverables</span>
                        <p className="font-bold text-foreground mt-0.5">{deliverablesCount} handed in</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40 border border-border/50">
                        <span className="text-muted-foreground text-[11px]">Tasks Done</span>
                        <p className="font-bold text-foreground mt-0.5">
                          {completedTasks}/{actionItems.length}
                        </p>
                      </div>
                    </div>

                    {/* Next Session indicator */}
                    {nextSession && (
                      <div className="text-xs border-t border-border/60 pt-3 flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Week {nextSession.weekNumber}: {nextSession.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            nextSession.status === "requested"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : nextSession.status === "scheduled"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : ""
                          }`}
                        >
                          {nextSession.status.replace("_", " ")}
                        </Badge>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTrack(track)}
                        className="rounded-xl text-xs gap-1.5 font-semibold flex-1"
                      >
                        <Eye className="size-3.5" /> 12 Weeks
                      </Button>

                      {nextSession && (
                        <Link
                          href={`/mentor/mentorship/tracks/${track.id}/sessions/${nextSession.id}`}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex-1 text-center"
                        >
                          Next Call &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Sessions & Calls */}
        <TabsContent value="sessions" className="mt-6 space-y-4">
          {!dashboard?.upcomingSessions || dashboard.upcomingSessions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border bg-card space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <CalendarDays className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground">No upcoming or pending sessions</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When students schedule calls or request 1:1 sessions, they will be listed here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Mentee</TableHead>
                    <TableHead>Session &amp; Week</TableHead>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.upcomingSessions.map((session) => {
                    const isRequested = session.status === "requested";
                    const isScheduled = session.status === "scheduled";

                    return (
                      <TableRow key={session.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-semibold text-foreground">
                            {session.student?.firstName} {session.student?.lastName || ""}
                          </div>
                          <div className="text-xs text-muted-foreground">{session.student?.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">
                            Week {session.weekNumber}: {session.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{session.format}</div>
                        </TableCell>
                        <TableCell>
                          {session.scheduledAt ? (
                            <div className="space-y-0.5">
                              <div className="text-xs font-semibold text-foreground">
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }).format(new Date(session.scheduledAt))}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {new Intl.DateTimeFormat("en-US", {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                }).format(new Date(session.scheduledAt))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unscheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isRequested ? (
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs gap-1"
                            >
                              <AlertCircle className="size-3" /> Requested by Mentee
                            </Badge>
                          ) : isScheduled ? (
                            <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                              <CheckCircle2 className="size-3" /> Scheduled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {session.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {session.meetingUrl && (
                              <a
                                href={session.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                <Video className="size-3.5" /> Join Meet
                              </a>
                            )}
                            <Link
                              href={`/mentor/mentorship/tracks/${session.trackId}/sessions/${session.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-input text-xs font-semibold hover:bg-muted"
                            >
                              Manage Call &rarr;
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: Deliverables & Work Submissions */}
        <TabsContent value="deliverables" className="mt-6 space-y-4">
          {allDeliverables.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border bg-card space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <FileText className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground">No deliverables submitted yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Deliverables, links to GitHub repositories, resumes, and system design docs handed in by
                your students will be organized here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Mentee</TableHead>
                    <TableHead>Deliverable Title</TableHead>
                    <TableHead>Curriculum Week</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDeliverables.map((deliv) => (
                    <TableRow key={deliv.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-semibold text-foreground">{deliv.studentName}</div>
                        <div className="text-xs text-muted-foreground">{deliv.studentEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                          <FileText className="size-3.5 text-primary" />
                          <span>{deliv.title}</span>
                        </div>
                        {deliv.url && (
                          <a
                            href={deliv.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline truncate max-w-xs block"
                          >
                            {deliv.url}
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Week {deliv.weekNumber}: {deliv.sessionTitle}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {deliv.url && (
                            <a
                              href={deliv.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-input text-xs font-semibold hover:bg-muted text-primary"
                            >
                              <ExternalLink className="size-3" /> View Work
                            </a>
                          )}
                          <Link
                            href={`/mentor/mentorship/tracks/${deliv.trackId}/sessions/${deliv.sessionId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold"
                          >
                            Add Feedback &rarr;
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 12-Week Tracker Modal for Mentor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          {selectedTrack && (
            <div className="py-2">
              <PersonalTrackView
                track={selectedTrack}
                canManage={true}
                baseHref={`/mentor/mentorship/tracks/${selectedTrack.id}/sessions`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
