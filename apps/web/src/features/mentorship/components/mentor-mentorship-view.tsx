"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Users,
  Target,
  ChevronRight,
  Eye,
  CalendarDays,
  Clock,
  Video,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { mentorshipService, type ProMentorshipTrack } from "@/services/mentorship.service";
import { PersonalTrackView } from "./personal-track-view";
import { toast } from "sonner";

export function MentorMentorshipView() {
  const queryClient = useQueryClient();
  const [selectedTrack, setSelectedTrack] = useState<ProMentorshipTrack | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [hasLoadedUrl, setHasLoadedUrl] = useState(false);

  const { data: calendlyData } = useQuery({
    queryKey: ["mentor-calendly-url"],
    queryFn: () => mentorshipService.getMentorCalendlyUrl(),
  });

  useEffect(() => {
    if (calendlyData && !hasLoadedUrl) {
      setCalendlyUrl(calendlyData.calendlyUrl || "");
      setHasLoadedUrl(true);
    }
  }, [calendlyData, hasLoadedUrl]);

  const updateCalendlyMutation = useMutation({
    mutationFn: (url: string) => mentorshipService.updateMentorCalendlyUrl(url),
    onSuccess: () => {
      toast.success("Calendly booking link updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["mentor-calendly-url"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-pro-tracks"] });
    },
    onError: () => {
      toast.error("Failed to update Calendly link");
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

  return (
    <div className="space-y-6">
      {/* Mentor Calendly Configuration Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border bg-gradient-to-r from-card via-card to-primary/5 p-4 sm:p-5 ring-1 ring-foreground/5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Calendly Integration</span>
            <Badge variant="outline" className="text-[10px]">1:1 Scheduling</Badge>
          </div>
          <p className="text-sm font-semibold text-foreground">Your 1:1 Booking Link</p>
          <p className="text-xs text-muted-foreground">
            Mentees will use this link to book their upcoming 1:1 sessions directly into your calendar.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 max-w-md">
          <Input
            placeholder="https://calendly.com/your-username/60min"
            value={calendlyUrl}
            onChange={(e) => setCalendlyUrl(e.target.value)}
            className="text-xs h-9 sm:w-80"
          />
          <Button
            size="sm"
            onClick={() => updateCalendlyMutation.mutate(calendlyUrl.trim())}
            disabled={updateCalendlyMutation.isPending}
            className="text-xs font-semibold shrink-0 h-9 px-4"
          >
            {updateCalendlyMutation.isPending ? "Saving..." : "Save Link"}
          </Button>
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
                <TableHead>Mentee Name & Contact</TableHead>
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
