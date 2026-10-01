"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { formatDate, formatTime } from "@/lib/format";
import { mentorshipService, type PersonalMentorshipSession } from "@/services/mentorship.service";
import { toast } from "sonner";

interface SessionDetailDialogProps {
  session: PersonalMentorshipSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage?: boolean; // true for Mentor / Super Admin
}

export function SessionDetailDialog({
  session,
  open,
  onOpenChange,
  canManage = false,
}: SessionDetailDialogProps) {
  const queryClient = useQueryClient();

  // Edit states
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [meetingUrl, setMeetingUrl] = useState<string>("");
  const [recordingUrl, setRecordingUrl] = useState<string>("");
  const [mentorFeedback, setMentorFeedback] = useState<string>("");
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("not_scheduled");
  const [actionItems, setActionItems] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newActionText, setNewActionText] = useState("");

  // Deliverables
  const [deliverables, setDeliverables] = useState<Array<{ title: string; url: string; type?: string }>>([]);
  const [newDelivTitle, setNewDelivTitle] = useState("");
  const [newDelivUrl, setNewDelivUrl] = useState("");

  // Sync state when session changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && session) {
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
    onOpenChange(isOpen);
  };

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<PersonalMentorshipSession>) => {
      if (!session) throw new Error("No session");
      return mentorshipService.updateSession(session.id, payload);
    },
    onSuccess: () => {
      toast.success("Mentorship session updated");
      queryClient.invalidateQueries({ queryKey: ["my-pro-track"] });
      queryClient.invalidateQueries({ queryKey: ["pro-track"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update session");
    },
  });

  const handleSave = () => {
    if (!session) return;
    if (canManage) {
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
    } else {
      // Student updating notes & action items
      updateMutation.mutate({
        studentNotes: studentNotes.trim() || null,
        actionItems,
      });
    }
  };

  const toggleActionItem = (id: string) => {
    const updated = actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setActionItems(updated);
  };

  const addActionItem = () => {
    if (!newActionText.trim()) return;
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: newActionText.trim(),
      completed: false,
    };
    setActionItems([...actionItems, newItem]);
    setNewActionText("");
  };

  const removeActionItem = (id: string) => {
    setActionItems(actionItems.filter((i) => i.id !== id));
  };

  const addDeliverable = () => {
    if (!newDelivTitle.trim() || !newDelivUrl.trim()) return;
    setDeliverables([...deliverables, { title: newDelivTitle.trim(), url: newDelivUrl.trim() }]);
    setNewDelivTitle("");
    setNewDelivUrl("");
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[11px] font-semibold uppercase">
              Week {session.weekNumber}
            </Badge>
            <Badge
              variant={
                status === "completed"
                  ? "default"
                  : status === "scheduled"
                    ? "secondary"
                    : "outline"
              }
              className="text-[11px]"
            >
              {status === "completed"
                ? "Completed"
                : status === "scheduled"
                  ? "Scheduled"
                  : "Not Scheduled"}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">{session.format}</span>
          </div>
          <DialogTitle className="text-xl font-bold leading-snug">
            {session.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Quick Schedule & Join Bar */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Session Schedule
                </p>
                {session.scheduledAt ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground mt-0.5">
                    <CalendarDays className="size-4 text-primary" />
                    <span>{formatDate(session.scheduledAt)}</span>
                    <span>·</span>
                    <Clock className="size-4 text-primary" />
                    <span>{formatTime(session.scheduledAt)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Date and time to be scheduled with your mentor.
                  </p>
                )}
              </div>

              {session.meetingUrl && (
                <Button
                  size="sm"
                  render={<a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" />}
                  className="rounded-xl gap-2 font-semibold shadow-xs"
                >
                  <Video className="size-4" />
                  <span>Join 1:1 Call</span>
                  <ExternalLink className="size-3.5 opacity-70" />
                </Button>
              )}
            </div>

            {session.recordingUrl && (
              <div className="border-t pt-2.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Video className="size-3.5 text-primary" /> Call Recording Available
                </span>
                <a
                  href={session.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Watch Recording <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>

          {/* Mentor Management Controls (if canManage) */}
          {canManage && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> Mentor / Admin Session Controls
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Session Date & Time" htmlFor="schedDate">
                  <Input
                    id="schedDate"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </FormField>

                <FormField label="Status" htmlFor="sessionStatus">
                  <select
                    id="sessionStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="not_scheduled">Not Scheduled</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>
          )}

          {/* Deliverables / Revised Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FileText className="size-4 text-primary" /> Deliverables & Documents
              </span>
            </div>

            {deliverables.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border">
                No deliverables attached for this session yet.
              </p>
            ) : (
              <div className="grid gap-2">
                {deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border bg-card p-2.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <span className="font-medium text-foreground">{deliv.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={deliv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Open <ExternalLink className="size-3" />
                      </a>
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
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Input
                  placeholder="Deliverable title (e.g. Revised Resume PDF)"
                  value={newDelivTitle}
                  onChange={(e) => setNewDelivTitle(e.target.value)}
                  className="text-xs"
                />
                <Input
                  placeholder="Document link (Google Drive / GitHub)"
                  value={newDelivUrl}
                  onChange={(e) => setNewDelivUrl(e.target.value)}
                  className="text-xs"
                />
                <Button size="sm" variant="outline" onClick={addDeliverable} className="shrink-0 text-xs">
                  <Plus className="size-3.5 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>

          {/* Mentor's Written Feedback */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <MessageSquare className="size-4 text-primary" /> Mentor Written Feedback
            </span>
            {canManage ? (
              <Textarea
                placeholder="Write specific takeaways, strengths, and areas to improve for this session..."
                value={mentorFeedback}
                onChange={(e) => setMentorFeedback(e.target.value)}
                rows={3}
              />
            ) : mentorFeedback ? (
              <div className="rounded-xl border bg-muted/30 p-3.5 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {mentorFeedback}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border">
                Mentor feedback will be published here after the 1:1 call.
              </p>
            )}
          </div>

          {/* Action Items Checklist */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> Action Items & Next Steps
            </span>

            {actionItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border">
                No action items added yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-2.5 text-sm"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleActionItem(item.id)}
                        className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span
                        className={item.completed ? "line-through text-muted-foreground text-xs" : "text-foreground text-xs font-medium"}
                      >
                        {item.text}
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeActionItem(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Add an action item (e.g. rewrite work experience section)..."
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addActionItem();
                  }
                }}
                className="text-xs"
              />
              <Button size="sm" variant="outline" onClick={addActionItem} className="shrink-0 text-xs">
                <Plus className="size-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Student's Personal Notes */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <BookOpen className="size-4 text-primary" /> Student Personal Takeaway Notes
            </span>
            <Textarea
              placeholder="Your private notes from this 1:1 session..."
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="font-semibold">
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
