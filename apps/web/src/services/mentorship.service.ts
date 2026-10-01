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

export interface PersonalMentorshipSession {
  id: string;
  trackId: string;
  weekNumber: number;
  title: string;
  format: string;
  mentorType: "senior_mentor" | "senior_specialist";
  scheduledAt: string | null;
  durationMins: number | null;
  status: "not_scheduled" | "scheduled" | "completed" | "cancelled";
  meetingUrl: string | null;
  recordingUrl: string | null;
  deliverables: Array<{ title: string; url: string; type?: string }>;
  mentorFeedback: string | null;
  actionItems: Array<{ id: string; text: string; completed: boolean }>;
  studentNotes: string | null;
  completedAt: string | null;
}

export interface ProMentorshipTrack {
  id: string;
  studentId: string;
  seniorMentorId: string | null;
  targetRole: string | null;
  targetCompany: string | null;
  startDate: string | null;
  status: string;
  createdAt: string;
  sessions: PersonalMentorshipSession[];
  student?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone?: string | null;
  };
  seniorMentor?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone?: string | null;
  };
}

export interface MyTrackResponse {
  isApproved: boolean;
  track?: ProMentorshipTrack;
  applicationStatus?: "pending" | "rejected" | "not_applied" | string;
  application?: MentorshipApplication | null;
}

export const mentorshipService = {
  createApplication: async (payload: CreateMentorshipApplicationPayload) => {
    return apiClient.post<{ id: string }>("/mentorship/applications", payload);
  },

  listApplications: async () => {
    return apiClient.get<MentorshipApplication[]>("/mentorship/applications");
  },

  approveApplication: async (
    id: string,
    payload: { seniorMentorId?: string; targetRole?: string; targetCompany?: string },
  ) => {
    return apiClient.post<ProMentorshipTrack>(`/mentorship/applications/${id}/approve`, payload);
  },

  rejectApplication: async (id: string) => {
    return apiClient.post(`/mentorship/applications/${id}/reject`, {});
  },

  getMyTrack: async () => {
    return apiClient.get<MyTrackResponse>("/mentorship/pro/my-track");
  },

  getTrackById: async (id: string) => {
    return apiClient.get<ProMentorshipTrack>(`/mentorship/pro/tracks/${id}`);
  },

  listAllTracks: async () => {
    return apiClient.get<ProMentorshipTrack[]>("/mentorship/pro/all-tracks");
  },

  listMentorTracks: async () => {
    return apiClient.get<ProMentorshipTrack[]>("/mentorship/pro/mentor-tracks");
  },

  getSessionById: async (sessionId: string) => {
    return apiClient.get<PersonalMentorshipSession & { track: ProMentorshipTrack }>(
      `/mentorship/pro/sessions/${sessionId}`,
    );
  },

  updateSession: async (sessionId: string, payload: Partial<PersonalMentorshipSession>) => {
    return apiClient.patch<PersonalMentorshipSession>(
      `/mentorship/pro/sessions/${sessionId}`,
      payload,
    );
  },
};
