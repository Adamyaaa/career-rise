import { apiClient } from "@/lib/api-client";

// Real API, read-only — the mentor view of a cohort's lessons, without the
// student-only progress fields returned by learningService.getCohortModules.
export interface ModuleWithLessons {
  id: string;
  title: string;
  order: number;
  scheduledFor: string | null;
  lessons: { id: string; title: string; order: number; slidesUrl: string | null; taught: boolean }[];
}

export const lessonBrowserService = {
  listModules: (cohortId: string) => apiClient.get<ModuleWithLessons[]>(`/cohorts/${cohortId}/modules`),
};
