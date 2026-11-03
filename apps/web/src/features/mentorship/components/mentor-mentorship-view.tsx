"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { mentorshipService, type ProMentorshipTrack } from "@/services/mentorship.service";
import { PersonalTrackView } from "./personal-track-view";
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
  const [selectedTrack, setSelectedTrack] = useState<ProMentorshipTrack | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [googleMeetUrl, setGoogleMeetUrl] = useState("");
  const [slots, setSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [newSlotInput, setNewSlotInput] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const { data: mentorTracks, isLoading } = useQuery({
    queryKey: ["mentor-pro-tracks"],
    queryFn: () => mentorshipService.listMentorTracks(),
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

  return (
    <div className="space-y-6">
      {/* Mentor 1:1 Google Meet & Availability Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Mentor 1:1 Setup
              </span>
              <Badge variant="outline" className="text-[10px] gap-1">
                <ShieldCheck className="size-3 text-emerald-600" />
                Private Link
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-foreground mt-0.5">
              Standing Google Meet Room &amp; Availability Slots
            </h3>
          </div>

          <Button
            size="sm"
            onClick={() =>
              updateSettingsMutation.mutate({
                googleMeetUrl: googleMeetUrl.trim(),
                availableSlots: slots,
              })
            }
            disabled={updateSettingsMutation.isPending}
            className="text-xs font-semibold shrink-0 h-9 px-4"
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Standing Google Meet Link */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Video className="size-3.5 text-muted-foreground" />
              Standing Google Meet Link
            </label>
            <Input
              placeholder="https://meet.google.com/abc-defg-hij"
              value={googleMeetUrl}
              onChange={(e) => setGoogleMeetUrl(e.target.value)}
              className="text-xs h-9"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Kept private to you and admin. When you accept a student&apos;s session request, this Google Meet link is automatically attached to their session.
            </p>
          </div>

          {/* Time Slots Configuration */}
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
                Reset defaults
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border border-border/80 bg-muted/20">
              {slots.map((slot, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border/60"
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
                <Plus className="size-3.5 mr-1" /> Add Slot
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : !mentorTracks || mentorTracks.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users className="size-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">No Mentees Assigned Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            When an administrator assigns a student to your 12-Week Pro Mentorship Track, their
            personalized roadmap will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Mentee Name &amp; Contact</TableHead>
                <TableHead>Target Goal</TableHead>
                <TableHead>Roadmap Progress</TableHead>
                <TableHead>Next Session</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentorTracks.map((track) => {
                const completed = track.sessions.filter((s) => s.status === "completed").length;
                const total = track.sessions.length || 12;
                const pct = Math.round((completed / total) * 100);
                const nextSession =
                  track.sessions.find((s) => s.status === "scheduled") ||
                  track.sessions.find((s) => s.status === "not_scheduled");

                return (
                  <TableRow key={track.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {track.student?.firstName} {track.student?.lastName || ""}
                      </div>
                      <div className="text-xs text-muted-foreground">{track.student?.email}</div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {track.targetRole || "—"}
                      {track.targetCompany && (
                        <span className="text-xs text-muted-foreground"> ({track.targetCompany})</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {completed}/{total} ({pct}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {nextSession ? (
                        <div>
                          <span className="font-medium text-foreground">Week {nextSession.weekNumber}:</span>{" "}
                          {nextSession.scheduledAt ? (
                            <span className="text-primary font-medium">
                              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
                                new Date(nextSession.scheduledAt),
                              )}
                            </span>
                          ) : (
                            "Unscheduled"
                          )}
                        </div>
                      ) : (
                        "Completed"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => openTrack(track)}
                        className="rounded-xl gap-1.5 text-xs font-semibold"
                      >
                        <Eye className="size-3.5" /> Manage 12 Weeks
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

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
