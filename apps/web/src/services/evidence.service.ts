import { apiClient } from "@/lib/api-client";

export interface EvidenceRecord {
  id: string;
  lessonId: string;
  cohortId: string;
  evidenceType: string;
  externalUrl: string | null;
  status: string;
  submittedAt: string;
}

export const evidenceService = {
  submit: (input: { lessonId: string; externalUrl: string }) => apiClient.post<EvidenceRecord>("/evidence", input),
  listMine: (cohortId: string) => apiClient.get<EvidenceRecord[]>(`/evidence?cohortId=${cohortId}`),
};
