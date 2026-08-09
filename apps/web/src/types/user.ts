import type { Role } from "@career-rise/shared";

export type { Role };

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  // Null on accounts created before names existed, and on OTP sign-ups (email only).
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export interface MentorProfile {
  userId: string;
  name: string;
  specializations: string[];
  capacity: number;
  activeStudentCount: number;
}
