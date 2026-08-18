import { apiClient } from "@/lib/api-client";

export interface Submission {
  id: string;
  url: string | null;
  projectName: string | null;
  githubUrl: string | null;
  driveUrl: string | null;
  projectSummary: string | null;
  note: string | null;
  submittedAt: string;
  status: string;
  student: { id: string; email: string; firstName: string | null; lastName: string | null };
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
}

// The same list endpoint serves both sides: a student gets only their own rows back,
// a mentor or admin gets the whole cohort's. The API decides by role.
export const submissionsService = {
  list: (cohortId: string) => apiClient.get<Submission[]>(`/cohorts/${cohortId}/submissions`),
  create: (input: { lessonId: string; projectName: string; driveUrl?: string; githubUrl?: string; projectSummary?: string; note?: string }) =>
    apiClient.post<{ id: string; externalUrl: string; submittedAt: string; status: string }>("/submissions", input),
  delete: (submissionId: string) => apiClient.delete<{ id: string; deleted: true }>(`/submissions/${submissionId}`),
};
