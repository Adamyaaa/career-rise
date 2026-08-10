import { apiClient } from "@/lib/api-client";
import type { Role } from "@/types/user";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  // Cohorts mentored, or cohorts enrolled in for a student.
  cohortCount: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  category: string[];
  _count: { cohorts: number };
}

export interface AdminCohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  // Earliest dated module; falls back to startDate in the UI when null.
  firstClassDate: string | null;
  course: { id: string; title: string };
  studentCount: number;
  moduleCount: number;
  mentors: { id: string; email: string; firstName: string | null; lastName: string | null }[];
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

// Every endpoint here is SUPER_ADMIN-only server-side; the UI gate is convenience only.
export const adminService = {
  listUsers: () => apiClient.get<AdminUser[]>("/admin/users"),
  createUser: (input: CreateUserInput) => apiClient.post<AdminUser>("/admin/users", input),
  updateUser: (
    id: string,
    input: {
      role?: Role;
      isActive?: boolean;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    },
  ) => apiClient.patch<AdminUser>(`/admin/users/${id}`, input),
  deleteUser: (id: string) => apiClient.delete<{ id: string; deleted: true }>(`/admin/users/${id}`),

  listCourses: () => apiClient.get<AdminCourse[]>("/admin/courses"),
  createCourse: (input: { title: string; description: string; category?: string[] }) =>
    apiClient.post<AdminCourse>("/admin/courses", input),
  deleteCourse: (id: string) => apiClient.delete<{ id: string }>(`/admin/courses/${id}`),

  listCohorts: () => apiClient.get<AdminCohort[]>("/admin/cohorts"),
  createCohort: (input: { courseId: string; name: string; startDate: string; endDate: string }) =>
    apiClient.post<AdminCohort>("/admin/cohorts", input),
  deleteCohort: (id: string) => apiClient.delete<{ id: string }>(`/admin/cohorts/${id}`),
  assignMentor: (cohortId: string, mentorUserId: string) =>
    apiClient.post<{ assigned: true }>(`/admin/cohorts/${cohortId}/mentors`, { mentorUserId }),
  unassignMentor: (cohortId: string, mentorUserId: string) =>
    apiClient.delete<{ assigned: false }>(`/admin/cohorts/${cohortId}/mentors/${mentorUserId}`),
};
