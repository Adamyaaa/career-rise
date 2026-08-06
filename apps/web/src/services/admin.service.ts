import { mockDelay } from "@/lib/mock-delay";
import { mockStudents, mockMentors, mockCourses, mockCohorts } from "@/lib/mock-seed";
import type { Role } from "@/types/user";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "suspended";
  createdAt: string;
}

const adminMockUsers: AdminUserRow[] = [
  ...mockStudents.map((s, i) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: "STUDENT" as Role,
    status: (i === 6 ? "invited" : "active") as AdminUserRow["status"],
    createdAt: `2026-06-${(10 + i).toString().padStart(2, "0")}T09:00:00Z`,
  })),
  ...mockMentors.map((m, i) => ({
    id: m.userId,
    name: m.name,
    email: `${m.name.split(" ")[0].toLowerCase()}@career-rise.test`,
    role: "MENTOR" as Role,
    status: "active" as AdminUserRow["status"],
    createdAt: `2026-05-${(10 + i).toString().padStart(2, "0")}T09:00:00Z`,
  })),
  {
    id: "adm-1",
    name: "Site Admin",
    email: "admin@career-rise.test",
    role: "SUPER_ADMIN",
    status: "active",
    createdAt: "2026-01-01T09:00:00Z",
  },
];

// MOCK — mirrors GET /admin/users, POST /courses, POST /cohorts,
// GET /admin/mentor-suggestions.
export const adminService = {
  listUsers: (params?: { role?: Role }): Promise<AdminUserRow[]> =>
    mockDelay(adminMockUsers.filter((u) => !params?.role || u.role === params.role)),

  listCourses: () => mockDelay(mockCourses),
  listCohorts: () => mockDelay(mockCohorts),

  mentorSuggestions: (courseId: string) =>
    mockDelay(
      mockMentors
        .map((m) => ({
          ...m,
          loadPercent: Math.round((m.activeStudentCount / m.capacity) * 100),
        }))
        .sort((a, b) => a.loadPercent - b.loadPercent),
    ),
};
