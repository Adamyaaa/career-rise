"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { attendanceService } from "@/services/attendance.service";
import { mockLessons } from "@/lib/mock-seed";
import type { AttendanceStatus } from "@/types/attendance";

const sessions = [
  { id: "session-1", label: mockLessons[0].title },
  { id: "session-2", label: mockLessons[1].title },
];

const statusOptions: AttendanceStatus[] = ["present", "late", "excused", "absent"];

export default function AttendancePage() {
  const [sessionId, setSessionId] = useState("session-1");
  const [pending, setPending] = useState<Record<string, AttendanceStatus>>({});
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ["attendance", sessionId],
    queryFn: () => attendanceService.listForSession(sessionId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      attendanceService.markAttendance(
        sessionId,
        Object.entries(pending).map(([studentId, status]) => ({ studentId, status })),
      ),
    onSuccess: () => {
      toast.success("Attendance saved");
      setPending({});
      queryClient.invalidateQueries({ queryKey: ["attendance", sessionId] });
    },
  });

  return (
    <>
      <PageHeading
        title="Attendance"
        description="Mark attendance for a session."
        action={
          <Select value={sessionId} onValueChange={(v) => v && setSessionId(v as string)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-lg" />)}
        </div>
      )}

      {!isLoading && records && (
        <>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="w-48">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium text-foreground">
                      <Link href={`/mentor/students/${record.studentId}`} className="hover:underline">
                        {record.studentName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={pending[record.studentId] ?? record.status}
                        onValueChange={(v) =>
                          v && setPending((prev) => ({ ...prev, [record.studentId]: v as AttendanceStatus }))
                        }
                      >
                        <SelectTrigger size="sm" className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            className="mt-4"
            disabled={Object.keys(pending).length === 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save attendance
          </Button>
        </>
      )}
    </>
  );
}
