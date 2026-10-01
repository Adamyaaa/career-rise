"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Video,
  FileText,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  BookOpen,
  ShieldCheck,
  Award,
  Link as LinkIcon,
  CheckSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  mentorshipService,
  type PersonalMentorshipSession,
  type ProMentorshipTrack,
} from "@/services/mentorship.service";
import { toast } from "sonner";

interface PersonalSessionDetailViewProps {
  session: PersonalMentorshipSession & { track: ProMentorshipTrack };
  backHref?: string;
  canManage?: boolean;
}

export function PersonalSessionDetailView({
  session,
  backHref = "/student/mentorship",
  canManage = false,
}: PersonalSessionDetailViewProps) {
  const queryClient = useQueryClient();

  // Local editable states
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [meetingUrl, setMeetingUrl] = useState<string>("");
  const [recordingUrl, setRecordingUrl] = useState<string>("");
  const [mentorFeedback, setMentorFeedback] = useState<string>("");
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("not_scheduled");
  const [actionItems, setActionItems] = useState<
    Array<{ id: string; text: string; completed: boolean }>
  >([]);
  const [newActionText, setNewActionText] = useState("");

  const [deliverables, setDeliverables] = useState<
    Array<{ title: string; url: string; type?: string }>
  >([]);
  const [newDelivTitle, setNewDelivTitle] = useState("");
  const [newDelivUrl, setNewDelivUrl] = useState("");

  useEffect(() => {
    if (session) {
      setScheduledAt(
        session.scheduledAt
          ? new Date(session.scheduledAt).toISOString().slice(0, 16)
          : "",
      );
      setMeetingUrl(session.meetingUrl || "");
      setRecordingUrl(session.recordingUrl || "");
      setMentorFeedback(session.mentorFeedback || "");
      setStudentNotes(session.studentNotes || "");
      setStatus(session.status);
      setActionItems(Array.isArray(session.actionItems) ? session.actionItems : []);
      setDeliverables(Array.isArray(session.deliverables) ? session.deliverables : []);
    }
  }, [session]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<PersonalMentorshipSession>) =>
      mentorshipService.updateSession(session.id, payload),
    onSuccess: () => {
      toast.success("Saved successfully");
      queryClient.invalidateQueries({ queryKey: ["mentorship-session", session.id] });
      queryClient.invalidateQueries({ queryKey: ["my-pro-track"] });
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save");
    },
  });

  const handleSaveNotes = () => {
    updateMutation.mutate({
      studentNotes: studentNotes.trim() || null,
      actionItems,
    });
  };

  const handleSaveMentorControls = () => {
    updateMutation.mutate({
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      meetingUrl: meetingUrl.trim() || null,
      recordingUrl: recordingUrl.trim() || null,
      mentorFeedback: mentorFeedback.trim() || null,
      studentNotes: studentNotes.trim() || null,
      status: status as any,
      deliverables,
      actionItems,
    });
  };

  const toggleActionItem = (id: string) => {
    const updated = actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setActionItems(updated);
    updateMutation.mutate({ actionItems: updated });
  };

  const addActionItem = () => {
    if (!newActionText.trim()) return;
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: newActionText.trim(),
      completed: false,
    };
    const updated = [...actionItems, newItem];
    setActionItems(updated);
    setNewActionText("");
    updateMutation.mutate({ actionItems: updated });
  };

  const removeActionItem = (id: string) => {
    const updated = actionItems.filter((i) => i.id !== id);
    setActionItems(updated);
    updateMutation.mutate({ actionItems: updated });
  };

  const addDeliverable = () => {
    if (!newDelivTitle.trim() || !newDelivUrl.trim()) return;
    const updated = [
      ...deliverables,
      { title: newDelivTitle.trim(), url: newDelivUrl.trim() },
    ];
    setDeliverables(updated);
    setNewDelivTitle("");
    setNewDelivUrl("");
    if (canManage) {
      updateMutation.mutate({ deliverables: updated });
    }
  };

  const removeDeliverable = (index: number) => {
    const updated = deliverables.filter((_, i) => i !== index);
    setDeliverables(updated);
    if (canManage) {
      updateMutation.mutate({ deliverables: updated });
    }
  };

  const isCompleted = session.status === "completed";
  const isScheduled = session.status === "scheduled";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
      {/* Back link */}
      <Link
        href={backHref}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to 1:1 Mentorship Roadmap
      </Link>

      {/* 1. Header Card (Matching ClassDetailPage format) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs ring-1 ring-foreground/5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground tracking-wider uppercase shadow-2xs">
              Week {session.weekNumber}
            </span>

            {isCompleted ? (
              <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                <CheckCircle2 className="size-3" /> Completed
              </Badge>
            ) : isScheduled ? (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 text-xs gap-1"
              >
                <CalendarDays className="size-3" /> Scheduled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Not scheduled
              </Badge>
            )}

            <span className="text-xs text-muted-foreground ml-1">{session.format}</span>
          </div>

          {session.meetingUrl && (
            <Button
              render={<a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" />}
              className="rounded-xl px-5 font-semibold gap-2 shadow-xs"
            >
              <Video className="size-4" />
              <span>Join 1:1 Video Call</span>
              <ExternalLink className="size-3.5 opacity-70" />
            </Button>
          )}
        </div>

        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {session.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground border-t pt-4 mt-2">
          {session.scheduledAt ? (
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <CalendarDays className="size-4 text-primary" />
              {formatDate(session.scheduledAt)} at {formatTime(session.scheduledAt)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-4 text-muted-foreground" />
              Schedule to be finalized with your mentor
            </span>
          )}

          {session.track?.seniorMentor && (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              Mentor: {session.track.seniorMentor.firstName}{" "}
              {session.track.seniorMentor.lastName || ""}
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-primary" />
            {session.durationMins || 75} mins duration
          </span>
        </div>
      </div>

      {/* Mentor Controls Panel (if canManage) */}
      {canManage && (
        <section className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 ring-1 ring-primary/20">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2">
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Sparkles className="size-4" /> Mentor / Admin Management Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Scheduled Date & Time" htmlFor="schedDate">
              <Input
                id="schedDate"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </FormField>

            <FormField label="Session Status" htmlFor="sessionStatus">
              <select
                id="sessionStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="not_scheduled">Not Scheduled</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Google Meet / Zoom URL" htmlFor="meetUrl">
              <Input
                id="meetUrl"
                placeholder="https://meet.google.com/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
              />
            </FormField>

            <FormField label="Call Recording Link" htmlFor="recUrl">
              <Input
                id="recUrl"
                placeholder="https://drive.google.com/..."
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveMentorControls}
              disabled={updateMutation.isPending}
              className="font-semibold px-6"
            >
              {updateMutation.isPending ? "Saving..." : "Update Session Details"}
            </Button>
          </div>
        </section>
      )}

      {/* 2. Deliverables & Material Section */}
      <section className="flex flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" /> Deliverables & Documents
          </h2>
        </div>

        {deliverables.length === 0 ? (
          <p className="text-sm text-muted-foreground italic rounded-xl bg-muted/20 p-4 border border-dashed">
            No deliverables or documents attached for this session yet.
          </p>
        ) : (
          <div className="grid gap-2.5">
            {deliverables.map((deliv, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border bg-muted/20 p-3.5 text-sm transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{deliv.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-md">{deliv.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    render={<a href={deliv.url} target="_blank" rel="noopener noreferrer" />}
                    className="gap-1.5 text-xs font-semibold rounded-xl"
                  >
                    <span>Open</span>
                    <ExternalLink className="size-3" />
                  </Button>

                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeDeliverable(idx)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {canManage && (
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t">
            <Input
              placeholder="Deliverable Title (e.g. Revised Resume PDF)"
              value={newDelivTitle}
              onChange={(e) => setNewDelivTitle(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Document URL (Google Drive / GitHub / Notion)"
              value={newDelivUrl}
              onChange={(e) => setNewDelivUrl(e.target.value)}
              className="text-sm"
            />
            <Button size="sm" variant="outline" onClick={addDeliverable} className="shrink-0 text-xs font-semibold">
              <Plus className="size-3.5 mr-1" /> Add Deliverable
            </Button>
          </div>
        )}
      </section>

      {/* 3. Mentor Written Feedback Section */}
      <section className="flex flex-col gap-3 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" /> Mentor Written Feedback & Takeaways
        </h2>

        {canManage ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Write detailed session feedback, strengths, weak spots, and coaching notes for the student..."
              value={mentorFeedback}
              onChange={(e) => setMentorFeedback(e.target.value)}
              rows={4}
              className="text-sm leading-relaxed"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveMentorControls} disabled={updateMutation.isPending} className="font-semibold">
                {updateMutation.isPending ? "Saving..." : "Save Feedback"}
              </Button>
            </div>
          </div>
        ) : mentorFeedback ? (
          <div className="rounded-xl border bg-primary/[0.03] border-primary/20 p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {mentorFeedback}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic rounded-xl bg-muted/20 p-4 border border-dashed">
            Your mentor will publish detailed evaluation and takeaway feedback here after your 1:1 call.
          </p>
        )}
      </section>

      {/* 4. Action Items Checklist */}
      <section className="flex flex-col gap-4 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <CheckSquare className="size-4 text-primary" /> Action Items & Next Steps
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {actionItems.filter((i) => i.completed).length} of {actionItems.length} completed
          </span>
        </div>

        {actionItems.length === 0 ? (
          <p className="text-sm text-muted-foreground italic rounded-xl bg-muted/20 p-4 border border-dashed">
            No action items added yet. Add tasks you need to complete before the next session.
          </p>
        ) : (
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 text-sm transition-all",
                  item.completed ? "bg-muted/30 opacity-70" : "bg-card shadow-2xs",
                )}
              >
                <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleActionItem(item.id)}
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      item.completed ? "line-through text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {item.text}
                  </span>
                </label>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeActionItem(item.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <Input
            placeholder="Add an action item (e.g. Rewrite leadership bullet points on resume)..."
            value={newActionText}
            onChange={(e) => setNewActionText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addActionItem();
              }
            }}
            className="text-sm"
          />
          <Button size="sm" variant="outline" onClick={addActionItem} className="shrink-0 font-semibold px-4">
            <Plus className="size-3.5 mr-1" /> Add Task
          </Button>
        </div>
      </section>

      {/* 5. Student Personal Notes */}
      <section className="flex flex-col gap-3 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="size-4 text-primary" /> Your Private Takeaway Notes
          </h2>
          <span className="text-xs text-muted-foreground">Visible only to you</span>
        </div>

        <Textarea
          placeholder="Record your thoughts, interview insights, questions to ask next time, or personal observations..."
          value={studentNotes}
          onChange={(e) => setStudentNotes(e.target.value)}
          rows={4}
          className="text-sm leading-relaxed"
        />

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={handleSaveNotes}
            disabled={updateMutation.isPending}
            className="font-semibold px-5"
          >
            {updateMutation.isPending ? "Saving Notes..." : "Save Notes"}
          </Button>
        </div>
      </section>
    </div>
  );
}
