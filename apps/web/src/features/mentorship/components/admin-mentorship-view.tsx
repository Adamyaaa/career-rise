"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  UserCheck,
  UserPlus,
  Target,
  ArrowRight,
  Eye,
  ShieldCheck,
  Search,
  RefreshCw,
  Users,
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
import {
  mentorshipService,
  type MentorshipApplication,
  type ProMentorshipTrack,
} from "@/services/mentorship.service";
import { adminService } from "@/services/admin.service";
import { PersonalTrackView } from "./personal-track-view";
import { toast } from "sonner";

export function AdminMentorshipView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active-tracks");
  const [searchQuery, setSearchQuery] = useState("");

  // Direct Match Student-Mentor Modal state
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchStudentId, setMatchStudentId] = useState("");
  const [matchMentorId, setMatchMentorId] = useState("");
  const [matchTargetRole, setMatchTargetRole] = useState("");
  const [matchTargetCompany, setMatchTargetCompany] = useState("");

  // Reassign Mentor Modal state
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [reassignTrack, setReassignTrack] = useState<ProMentorshipTrack | null>(null);
  const [newMentorId, setNewMentorId] = useState("");

  // Application Approval Modal state
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

  const mentors = useMemo(
    () => users?.filter((u) => u.role === "MENTOR" || u.role === "SUPER_ADMIN") || [],
    [users]
  );

  const students = useMemo(
    () => users?.filter((u) => u.role === "STUDENT") || [],
    [users]
  );

  // Map student IDs that already have an active track
  const studentTrackMap = useMemo(() => {
    const map = new Map<string, ProMentorshipTrack>();
    activeTracks?.forEach((t) => {
      map.set(t.studentId, t);
    });
    return map;
  }, [activeTracks]);

  // Mutations
  const matchStudentMutation = useMutation({
    mutationFn: (payload: {
      studentId: string;
      seniorMentorId: string;
      targetRole?: string;
      targetCompany?: string;
    }) => mentorshipService.matchStudent(payload),
    onSuccess: () => {
      toast.success("Student successfully connected with Mentor!");
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["mentorship-applications"] });
      setMatchDialogOpen(false);
      setMatchStudentId("");
      setMatchMentorId("");
      setMatchTargetRole("");
      setMatchTargetCompany("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to match student with mentor");
    },
  });

  const reassignMentorMutation = useMutation({
    mutationFn: ({ trackId, seniorMentorId }: { trackId: string; seniorMentorId: string }) =>
      mentorshipService.updateTrack(trackId, { seniorMentorId }),
    onSuccess: () => {
      toast.success("Mentor reassigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-pro-tracks"] });
      setReassignDialogOpen(false);
      setReassignTrack(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reassign mentor");
    },
  });

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

  const handleMatchSubmit = () => {
    if (!matchStudentId) {
      toast.error("Please select a student");
      return;
    }
    if (!matchMentorId) {
      toast.error("Please select a mentor");
      return;
    }
    matchStudentMutation.mutate({
      studentId: matchStudentId,
      seniorMentorId: matchMentorId,
      targetRole: matchTargetRole.trim() || undefined,
      targetCompany: matchTargetCompany.trim() || undefined,
    });
  };

  const openReassignDialog = (track: ProMentorshipTrack) => {
    setReassignTrack(track);
    setNewMentorId(track.seniorMentorId || "");
    setReassignDialogOpen(true);
  };

  const handleReassignSubmit = () => {
    if (!reassignTrack || !newMentorId) return;
    reassignMentorMutation.mutate({
      trackId: reassignTrack.id,
      seniorMentorId: newMentorId,
    });
  };

  const openTrackInspector = (track: ProMentorshipTrack) => {
    setInspectTrack(track);
    setInspectDialogOpen(true);
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    if (!activeTracks) return [];
    if (!searchQuery.trim()) return activeTracks;
    const q = searchQuery.toLowerCase();
    return activeTracks.filter((t) => {
      const studentName = `${t.student?.firstName || ""} ${t.student?.lastName || ""}`.toLowerCase();
      const studentEmail = (t.student?.email || "").toLowerCase();
      const mentorName = `${t.seniorMentor?.firstName || ""} ${t.seniorMentor?.lastName || ""}`.toLowerCase();
      const targetRole = (t.targetRole || "").toLowerCase();
      const targetCompany = (t.targetCompany || "").toLowerCase();
      return (
        studentName.includes(q) ||
        studentEmail.includes(q) ||
        mentorName.includes(q) ||
        targetRole.includes(q) ||
        targetCompany.includes(q)
      );
    });
  }, [activeTracks, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar with direct Student-Mentor matching CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-card shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">1:1 Mentorship Operations</h2>
            <Badge variant="outline" className="text-xs">
              {activeTracks?.length || 0} Matched Pairs
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect students with senior mentors directly, reassign mentors, and inspect 12-week roadmaps
          </p>
        </div>

        <Button
          onClick={() => setMatchDialogOpen(true)}
          className="rounded-xl font-semibold gap-2 shadow-xs shrink-0"
        >
          <UserPlus className="size-4" />
          Connect Student &amp; Mentor
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList variant="line">
            <TabsTrigger value="active-tracks">
              Active Matched Tracks ({activeTracks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="applications">
              Public Applications ({applications?.length || 0})
            </TabsTrigger>
          </TabsList>

          {activeTab === "active-tracks" && (
            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students or mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Active 12-Week Pro Tracks */}
        <TabsContent value="active-tracks" className="mt-6">
          {loadingTracks ? (
            <div className="flex justify-center p-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredTracks || filteredTracks.length === 0 ? (
            <div className="text-center p-12 border rounded-2xl bg-card space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Users className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground">No mentorship tracks found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? "No students or mentors match your search query."
                  : "Connect your first student with a mentor using the 'Connect Student & Mentor' button above."}
              </p>
              {!searchQuery && (
                <Button
                  size="sm"
                  onClick={() => setMatchDialogOpen(true)}
                  className="rounded-xl text-xs gap-1.5"
                >
                  <UserPlus className="size-3.5" /> Connect Now
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assigned Senior Mentor</TableHead>
                    <TableHead>Target Goal</TableHead>
                    <TableHead>12-Week Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTracks.map((track) => {
                    const completed = track.sessions.filter((s) => s.status === "completed").length;
                    const total = track.sessions.length || 12;
                    const pct = Math.round((completed / total) * 100);

                    return (
                      <TableRow key={track.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-semibold text-foreground">
                            {track.student?.firstName} {track.student?.lastName || ""}
                          </div>
                          <div className="text-xs text-muted-foreground">{track.student?.email}</div>
                          {track.student?.phone && (
                            <div className="text-[11px] text-muted-foreground">{track.student.phone}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {track.seniorMentor ? (
                            <div className="space-y-1">
                              <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                                <span>
                                  {track.seniorMentor.firstName} {track.seniorMentor.lastName || ""}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {track.seniorMentor.email}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
                              Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-foreground">{track.targetRole || "—"}</div>
                          {track.targetCompany && (
                            <div className="text-xs text-muted-foreground">Target: {track.targetCompany}</div>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReassignDialog(track)}
                              className="rounded-xl gap-1 text-xs"
                              title="Reassign or change mentor"
                            >
                              <RefreshCw className="size-3" /> Reassign
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openTrackInspector(track)}
                              className="rounded-xl gap-1.5 text-xs font-semibold"
                            >
                              <Eye className="size-3.5" /> Inspect 12 Weeks
                            </Button>
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

        {/* Tab 2: Applications */}
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
                                <Sparkles className="size-3.5" /> Approve &amp; Match
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
      </Tabs>

      {/* Direct Connect / Match Student with Mentor Modal */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              Connect / Match Student with Mentor
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pair any registered student with a dedicated senior mentor. This creates or updates their
              12-Week Pro Mentorship Track and personal curriculum.
            </p>

            <FormField label="Select Student *" htmlFor="studentMatchSelect">
              <select
                id="studentMatchSelect"
                value={matchStudentId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setMatchStudentId(sId);
                  const existing = studentTrackMap.get(sId);
                  if (existing) {
                    if (existing.targetRole) setMatchTargetRole(existing.targetRole);
                    if (existing.targetCompany) setMatchTargetCompany(existing.targetCompany);
                    if (existing.seniorMentorId) setMatchMentorId(existing.seniorMentorId);
                  }
                }}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a Student...</option>
                {students.map((s) => {
                  const existing = studentTrackMap.get(s.id);
                  const label = `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email;
                  return (
                    <option key={s.id} value={s.id}>
                      {label} ({s.email}) {existing ? "— [Already in Track]" : ""}
                    </option>
                  );
                })}
              </select>
            </FormField>

            <FormField label="Select Senior Mentor *" htmlFor="mentorMatchSelect">
              <select
                id="mentorMatchSelect"
                value={matchMentorId}
                onChange={(e) => setMatchMentorId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select a Senior Mentor...</option>
                {mentors.map((m) => {
                  const count = activeTracks?.filter((t) => t.seniorMentorId === m.id).length || 0;
                  const label = `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email;
                  return (
                    <option key={m.id} value={m.id}>
                      {label} ({m.email}) — [{count} active {count === 1 ? "mentee" : "mentees"}]
                    </option>
                  );
                })}
              </select>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Target Career Role" htmlFor="targetRoleInput">
                <Input
                  id="targetRoleInput"
                  value={matchTargetRole}
                  onChange={(e) => setMatchTargetRole(e.target.value)}
                  placeholder="e.g. SDE-2, Full Stack Dev"
                />
              </FormField>

              <FormField label="Target Company (Optional)" htmlFor="targetCompanyInput">
                <Input
                  id="targetCompanyInput"
                  value={matchTargetCompany}
                  onChange={(e) => setMatchTargetCompany(e.target.value)}
                  placeholder="e.g. Microsoft, Google, FinTech"
                />
              </FormField>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMatchSubmit}
              disabled={matchStudentMutation.isPending}
              className="font-semibold gap-1.5"
            >
              {matchStudentMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  <UserCheck className="size-4" /> Match &amp; Activate Track
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Mentor Modal */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-4 text-primary" />
              Reassign Senior Mentor
            </DialogTitle>
          </DialogHeader>

          {reassignTrack && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
                <p className="font-semibold text-foreground">
                  Student: {reassignTrack.student?.firstName} {reassignTrack.student?.lastName || ""}
                </p>
                <p className="text-muted-foreground">{reassignTrack.student?.email}</p>
                <p className="text-muted-foreground">
                  Current Mentor:{" "}
                  {reassignTrack.seniorMentor
                    ? `${reassignTrack.seniorMentor.firstName} ${reassignTrack.seniorMentor.lastName || ""}`
                    : "None (Unassigned)"}
                </p>
              </div>

              <FormField label="Choose New Mentor *" htmlFor="newMentorSelect">
                <select
                  id="newMentorSelect"
                  value={newMentorId}
                  onChange={(e) => setNewMentorId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select Mentor...</option>
                  {mentors.map((m) => {
                    const count = activeTracks?.filter((t) => t.seniorMentorId === m.id).length || 0;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.email}) — [{count} mentees]
                      </option>
                    );
                  })}
                </select>
              </FormField>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReassignSubmit}
              disabled={reassignMentorMutation.isPending || !newMentorId}
              className="font-semibold"
            >
              {reassignMentorMutation.isPending ? "Reassigning..." : "Confirm Reassignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Application & Enroll Modal */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve &amp; Match 12-Week Pro Track</DialogTitle>
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
