import { apiClient } from "@/lib/api-client";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  link: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; email: string; firstName: string | null; lastName: string | null };
}

export interface AnnouncementInput {
  title: string;
  content: string;
  link?: string;
}

// Reading is open to anyone with access to the cohort; writing is mentor/admin only,
// enforced server-side.
export const announcementsService = {
  list: (cohortId: string) => apiClient.get<Announcement[]>(`/cohorts/${cohortId}/announcements`),
  create: (cohortId: string, input: AnnouncementInput) =>
    apiClient.post<Announcement>(`/cohorts/${cohortId}/announcements`, input),
  update: (id: string, input: AnnouncementInput) =>
    apiClient.patch<Announcement>(`/announcements/${id}`, input),
  delete: (id: string) => apiClient.delete<{ id: string; deleted: true }>(`/announcements/${id}`),
};
