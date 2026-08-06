import type { Role } from "@career-rise/shared";

export type { Role };

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  name?: string;
  avatarUrl?: string;
}

export interface MentorProfile {
  userId: string;
  name: string;
  specializations: string[];
  capacity: number;
  activeStudentCount: number;
}
