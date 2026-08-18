import { apiClient } from "@/lib/api-client";

export interface CreateMentorshipApplicationPayload {
  name: string;
  email: string;
  currentRole?: string;
  targetRole?: string;
  timeline?: string;
}

export interface MentorshipApplication {
  id: string;
  name: string;
  email: string;
  currentRole: string | null;
  targetRole: string | null;
  timeline: string | null;
  status: string;
  createdAt: string;
}

export const mentorshipService = {
  createApplication: async (payload: CreateMentorshipApplicationPayload) => {
    return apiClient.post<{ id: string }>("/mentorship/applications", payload);
  },

  listApplications: async () => {
    return apiClient.get<MentorshipApplication[]>("/mentorship/applications");
  },
};
