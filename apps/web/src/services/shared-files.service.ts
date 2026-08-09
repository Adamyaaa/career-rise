import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export interface SharedFile {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  cohortId?: string;
  lessonId?: string;
  createdAt: string;
  uploadedBy: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export const sharedFilesService = {
  list: (params?: { cohortId?: string; lessonId?: string }) => {
    const query = new URLSearchParams();
    if (params?.cohortId) query.set("cohortId", params.cohortId);
    if (params?.lessonId) query.set("lessonId", params.lessonId);
    const qs = query.toString();
    return apiClient.get<SharedFile[]>(`/shared-files${qs ? `?${qs}` : ""}`);
  },

  upload: async (formData: FormData): Promise<SharedFile> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";
    const token = useAuthStore.getState().accessToken;

    const res = await fetch(`${API_BASE_URL}/shared-files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error?.message || "Upload failed");
    }

    return res.json() as Promise<SharedFile>;
  },

  delete: (id: string) => apiClient.delete(`/shared-files/${id}`),
};
