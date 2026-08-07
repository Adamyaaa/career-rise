import { apiClient } from "@/lib/api-client";

// Real API, read-only — just enough for the mentor material-upload lesson picker.
export interface CohortSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  course: { id: string; title: string };
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  order: number;
  lessons: { id: string; title: string; order: number }[];
}

export const lessonBrowserService = {
  listCohorts: () => apiClient.get<CohortSummary[]>("/cohorts"),
  listModules: (cohortId: string) => apiClient.get<ModuleWithLessons[]>(`/cohorts/${cohortId}/modules`),
};
