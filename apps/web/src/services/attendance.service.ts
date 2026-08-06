import { mockDelay } from "@/lib/mock-delay";
import { mockAttendance } from "@/lib/mock-seed";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

// MOCK — mirrors GET/POST /sessions/:id/attendance and GET /students/:id/attendance.
export const attendanceService = {
  listForSession: (sessionId: string): Promise<AttendanceRecord[]> =>
    mockDelay(mockAttendance.filter((a) => a.learningSessionId === sessionId)),

  listForStudent: (studentId: string, cohortId?: string): Promise<AttendanceRecord[]> =>
    mockDelay(
      mockAttendance.filter((a) => a.studentId === studentId && (!cohortId || a.cohortId === cohortId)),
    ),

  markAttendance: (
    sessionId: string,
    records: { studentId: string; status: AttendanceStatus }[],
  ): Promise<{ success: true }> => mockDelay({ success: true }, 600),
};
