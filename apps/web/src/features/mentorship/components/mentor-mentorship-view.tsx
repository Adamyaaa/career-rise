"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { mentorshipService, type ProMentorshipTrack } from "@/services/mentorship.service";
import { PersonalTrackView } from "./personal-track-view";

export function MentorMentorshipView() {
  const [selectedTrack, setSelectedTrack] = useState<ProMentorshipTrack | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: mentorTracks, isLoading } = useQuery({
    queryKey: ["mentor-pro-tracks"],
    queryFn: () => mentorshipService.listMentorTracks(),
  });

  const openTrack = (track: ProMentorshipTrack) => {
    setSelectedTrack(track);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mentorTracks || mentorTracks.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
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
