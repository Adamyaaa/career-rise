import { apiClient } from "@/lib/api-client";

// Real API, read-only — the mentor view of a cohort's lessons, without the
// student-only progress fields returned by learningService.getCohortModules.
export interface ModuleWithLessons {
  id: string;
  title: string;
  order: number;
  lessons: {
    id: string;
    title: string;
    order: number;
    // Mentor-written summary of what this class covers.
    content: string;
    slides: { title: string; url: string }[];
    assignmentsUrl: string | null;
    // When the class runs — date and time. Null means unscheduled.
    scheduledAt: string | null;
    // Mentor-set: this class expects work to be handed in.
    submissionRequired: boolean;
    // Derived from the schedule; `cancelled` is the only delivery fact a mentor records.
    taught: boolean;
    cancelled: boolean;
  }[];
}

export const lessonBrowserService = {
  listModules: (cohortId: string) => apiClient.get<ModuleWithLessons[]>(`/cohorts/${cohortId}/modules`),
};
