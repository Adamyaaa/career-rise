"use client";

import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mentorshipService } from "@/services/mentorship.service";
import { Loader2 } from "lucide-react";

export function MentorshipApplicationsView() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["mentorship-applications"],
    queryFn: () => mentorshipService.listApplications(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center p-12 border rounded-xl bg-card">
        <p className="text-muted-foreground">No mentorship applications yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Target Role</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Applied</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div className="font-medium text-foreground">{app.name}</div>
                <div className="text-sm text-muted-foreground">{app.email}</div>
              </TableCell>
              <TableCell className="text-sm">{app.currentRole || "—"}</TableCell>
              <TableCell className="text-sm">{app.targetRole || "—"}</TableCell>
              <TableCell className="text-sm max-w-[200px] truncate" title={app.timeline || ""}>
                {app.timeline || "—"}
              </TableCell>
              <TableCell>
                <Badge variant={app.status === "pending" ? "secondary" : "outline"}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(app.createdAt))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
