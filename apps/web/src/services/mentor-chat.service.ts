import { apiClient } from "@/lib/api-client";

export interface MentorUserBrief {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  mentorProfile?: {
    specializations?: string[];
    calendlyUrl?: string | null;
  } | null;
}

export interface StudentMentorResponse {
  mentor: MentorUserBrief | null;
  source: "pro_track" | "cohort" | "general";
  trackTitle?: string;
  cohortName?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  };
}

export interface ChatThread {
  id: string;
  studentId: string;
  mentorId: string | null;
  cohortId: string | null;
  title: string;
  status: "open" | "resolved";
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  mentor?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  cohort?: {
    id: string;
    name: string;
  } | null;
  messages?: ChatMessage[];
}

export const mentorChatService = {
  getStudentMentor: async () => {
    return apiClient.get<StudentMentorResponse>("/mentor-chat/mentor");
  },

  getThreads: async () => {
    return apiClient.get<ChatThread[]>("/mentor-chat/threads");
  },

  getThreadById: async (threadId: string) => {
    return apiClient.get<ChatThread>(`/mentor-chat/threads/${threadId}`);
  },

  createThread: async (payload: {
    title?: string;
    initialMessage: string;
    cohortId?: string;
    mentorId?: string;
  }) => {
    return apiClient.post<ChatThread>("/mentor-chat/threads", payload);
  },

  sendMessage: async (threadId: string, content: string) => {
    return apiClient.post<ChatMessage>(`/mentor-chat/threads/${threadId}/messages`, {
      content,
    });
  },

  updateThreadStatus: async (threadId: string, status: "open" | "resolved") => {
    return apiClient.patch<ChatThread>(`/mentor-chat/threads/${threadId}/status`, {
      status,
    });
  },
};
