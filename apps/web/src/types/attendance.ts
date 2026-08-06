export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  learningSessionId: string;
  sessionTitle: string;
  studentId: string;
  studentName: string;
  cohortId: string;
  status: AttendanceStatus;
  markedAt: string;
}
