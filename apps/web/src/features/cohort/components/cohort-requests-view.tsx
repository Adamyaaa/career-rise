"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserX, Clock, GraduationCap, Inbox, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/empty-state";
import { learningService, rosterService } from "@/services/learning.service";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export function CohortRequestsView() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["cohort-requests", statusFilter],
    queryFn: () => learningService.listCohortRequests(statusFilter),
  });

  const approve = useMutation({
    mutationFn: ({ cohortId, studentId }: { cohortId: string; studentId: string }) =>
      rosterService.approve(cohortId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-cohorts"] });
      toast.success("Student approved and activated in cohort!");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to approve student"),
  });

  const decline = useMutation({
    mutationFn: ({ cohortId, studentId }: { cohortId: string; studentId: string }) =>
      rosterService.withdraw(cohortId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-cohorts"] });
      toast.success("Request declined and withdrawn");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to decline request"),
  });

  const handleDecline = (cohortId: string, studentId: string, studentName: string) => {
    if (confirm(`Decline access request for ${studentName}?`)) {
      decline.mutate({ cohortId, studentId });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList variant="line">
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {requests && statusFilter === "pending" && requests.length > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Approved</TabsTrigger>
            <TabsTrigger value="withdrawn">Declined</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (!requests || requests.length === 0) && (
        <EmptyState
          icon={statusFilter === "pending" ? Inbox : GraduationCap}
          title={statusFilter === "pending" ? "No pending cohort requests" : "No requests found"}
          description={
            statusFilter === "pending"
              ? "When students request access to cohorts requiring approval, they will appear here."
              : "There are currently no cohort enrollment requests matching this filter."
          }
        />
      )}

      {!isLoading && requests && requests.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[260px]">Student</TableHead>
                <TableHead>Cohort & Course</TableHead>
                <TableHead className="w-[160px]">Requested Date</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const isPending = request.status === "pending";
                const isActive = request.status === "active";
                const isWithdrawn = request.status === "withdrawn";

                return (
                  <TableRow key={request.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium text-foreground">{request.studentName}</div>
                      <div className="text-xs text-muted-foreground">{request.studentEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="w-fit rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                          {request.cohortName}
                        </span>
                        <span className="font-heading text-sm text-foreground font-medium">
                          {request.courseTitle}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(request.requestedAt)}
                    </TableCell>
                    <TableCell>
                      {isPending && (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">
                          <Clock className="mr-1 size-3" /> Pending
                        </Badge>
                      )}
                      {isActive && (
                        <Badge variant="secondary" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                          Active
                        </Badge>
                      )}
                      {isWithdrawn && (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          Declined
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
                            onClick={() =>
                              approve.mutate({
                                cohortId: request.cohortId,
                                studentId: request.studentId,
                              })
                            }
                            disabled={approve.isPending || decline.isPending}
                          >
                            <UserCheck className="size-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              handleDecline(request.cohortId, request.studentId, request.studentName)
                            }
                            disabled={approve.isPending || decline.isPending}
                          >
                            <UserX className="size-3.5" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
