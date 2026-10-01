"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  UserCheck,
  Target,
  ArrowRight,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { mentorshipService, type MentorshipApplication, type ProMentorshipTrack } from "@/services/mentorship.service";
import { adminService } from "@/services/admin.service";
import { PersonalTrackView } from "./personal-track-view";
import { toast } from "sonner";

export function AdminMentorshipView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("applications");

  // Approval Modal state
  const [selectedApp, setSelectedApp] = useState<MentorshipApplication | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [seniorMentorId, setSeniorMentorId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");

  // Track Inspect Modal state
  const [inspectTrack, setInspectTrack] = useState<ProMentorshipTrack | null>(null);
  const [inspectDialogOpen, setInspectDialogOpen] = useState(false);

  // Queries
  const { data: applications, isLoading: loadingApps } = useQuery({
    queryKey: ["mentorship-applications"],
    queryFn: () => mentorshipService.listApplications(),
  });

  const { data: activeTracks, isLoading: loadingTracks } = useQuery({
    queryKey: ["all-pro-tracks"],
    queryFn: () => mentorshipService.listAllTracks(),
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.listUsers(),
  });

  const mentors = users?.filter((u) => u.role === "MENTOR" || u.role === "SUPER_ADMIN") || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({
      appId,
      seniorMentorId,
      targetRole,
      targetCompany,
    }: {
      appId: string;
      seniorMentorId?: string;
      targetRole?: string;
      targetCompany?: string;
    }) =>
      mentorshipService.approveApplication(appId, {
        seniorMentorId,
        targetRole,
        targetCompany,
      }),
    onSuccess: () => {
      toast.success("Application approved! 12-Week Pro Track initialized.");
      queryClient.invalidateQueries({ queryKey: ["mentorship-applications"] });
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      setApprovalDialogOpen(false);
      setSelectedApp(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve application");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (appId: string) => mentorshipService.rejectApplication(appId),
    onSuccess: () => {
      toast.success("Application marked as rejected");
      queryClient.invalidateQueries({ queryKey: ["mentorship-applications"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject application");
    },
  });

  const openApprovalDialog = (app: MentorshipApplication) => {
    setSelectedApp(app);
    setTargetRole(app.targetRole || "");
    setTargetCompany("");
    setSeniorMentorId("");
    setApprovalDialogOpen(true);
  };

  const handleApproveSubmit = () => {
    if (!selectedApp) return;
    approveMutation.mutate({
      appId: selectedApp.id,
      seniorMentorId: seniorMentorId || undefined,
      targetRole: targetRole.trim() || undefined,
      targetCompany: targetCompany.trim() || undefined,
    });
  };

  const openTrackInspector = (track: ProMentorshipTrack) => {
    setInspectTrack(track);
    setInspectDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="applications">
            Applications ({applications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active-tracks">
            Active 12-Week Pro Tracks ({activeTracks?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Applications */}
        <TabsContent value="applications" className="mt-6">
          {loadingApps ? (
            <div className="flex justify-center p-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="text-center p-12 border rounded-2xl bg-card">
              <p className="text-muted-foreground">No mentorship applications received yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Target Role</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const isPending = app.status === "pending";
                    const isApproved = app.status === "approved" || app.status === "enrolled";
                    const isRejected = app.status === "rejected";

                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{app.name}</div>
                          <div className="text-xs text-muted-foreground">{app.email}</div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{app.targetRole || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{app.currentRole || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate" title={app.timeline || ""}>
                          {app.timeline || "—"}
                        </TableCell>
                        <TableCell>
                          {isPending ? (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs">
                              Pending Review
                            </Badge>
                          ) : isApproved ? (
                            <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                              <CheckCircle2 className="size-3" /> Enrolled in Pro
                            </Badge>
                          ) : isRejected ? (
                            <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
                              Rejected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">{app.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => openApprovalDialog(app)}
                                className="rounded-xl font-semibold gap-1 text-xs"
                              >
                                <Sparkles className="size-3.5" /> Approve & Enroll
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMutation.mutate(app.id)}
                                disabled={rejectMutation.isPending}
                                className="rounded-xl text-destructive hover:bg-destructive/10 text-xs"
                              >
                                <XCircle className="size-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : isApproved ? (
                            <span className="text-xs text-muted-foreground">Track Active</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openApprovalDialog(app)}
                              className="text-xs text-primary"
                            >
                              Re-evaluate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Active 12-Week Pro Tracks */}
        <TabsContent value="active-tracks" className="mt-6">
          {loadingTracks ? (
            <div className="flex justify-center p-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : !activeTracks || activeTracks.length === 0 ? (
            <div className="text-center p-12 border rounded-2xl bg-card">
              <p className="text-muted-foreground">No active 12-week Pro mentorship tracks found.</p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assigned Senior Mentor</TableHead>
                    <TableHead>Target Goal</TableHead>
                    <TableHead>Roadmap Progress</TableHead>
                    <TableHead className="text-right">Manage Track</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTracks.map((track) => {
                    const completed = track.sessions.filter((s) => s.status === "completed").length;
                    const total = track.sessions.length || 12;
                    const pct = Math.round((completed / total) * 100);

                    return (
                      <TableRow key={track.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">
                            {track.student?.firstName} {track.student?.lastName || ""}
                          </div>
                          <div className="text-xs text-muted-foreground">{track.student?.email}</div>
                        </TableCell>
                        <TableCell>
                          {track.seniorMentor ? (
                            <div className="text-sm font-medium flex items-center gap-1.5">
                              <ShieldCheck className="size-3.5 text-primary" />
                              <span>{track.seniorMentor.firstName} {track.seniorMentor.lastName || ""}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {track.targetRole || "—"}
                          {track.targetCompany && <span className="text-xs text-muted-foreground"> ({track.targetCompany})</span>}
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
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTrackInspector(track)}
                            className="rounded-xl gap-1.5 text-xs font-semibold"
                          >
                            <Eye className="size-3.5" /> Inspect 12 Weeks
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Application & Enroll Modal */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve & Initialize 12-Week Pro Track</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border bg-muted/30 p-3.5 text-xs space-y-1">
                <p className="font-semibold text-foreground">{selectedApp.name}</p>
                <p className="text-muted-foreground">{selectedApp.email}</p>
                {selectedApp.currentRole && (
                  <p className="text-muted-foreground">Current: {selectedApp.currentRole}</p>
                )}
              </div>

              <FormField label="Assign Senior Mentor *" htmlFor="mentorSelect">
                <select
                  id="mentorSelect"
                  value={seniorMentorId}
                  onChange={(e) => setSeniorMentorId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select a Senior Mentor...</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.email})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Target Role" htmlFor="targetRoleInput">
                <Input
                  id="targetRoleInput"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SDE-2 at Microsoft"
                />
              </FormField>

              <FormField label="Target Company (Optional)" htmlFor="targetCompanyInput">
                <Input
                  id="targetCompanyInput"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Amazon, Google, Startups"
                />
              </FormField>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveSubmit} disabled={approveMutation.isPending} className="font-semibold">
              {approveMutation.isPending ? "Initializing Track..." : "Confirm & Enroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Inspection Modal */}
      <Dialog open={inspectDialogOpen} onOpenChange={setInspectDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          {inspectTrack && (
            <div className="py-2">
              <PersonalTrackView
                track={inspectTrack}
                canManage={true}
                baseHref={`/mentor/mentorship/tracks/${inspectTrack.id}/sessions`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
