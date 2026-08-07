import { apiClient } from "@/lib/api-client";

export interface Progress {
  completedLessons: number;
  totalLessons: number;
  percent: number;
}

export interface MyCohortSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  course: { id: string; title: string };
  // Present for STUDENT (their own completion); absent for MENTOR, who has none.
  progress?: Progress;
}

export interface LessonProgress {
  id: string;
  title: string;
  order: number;
  completed: boolean;
}

export interface ModuleProgress extends Progress {
  id: string;
  title: string;
  order: number;
  lessons: LessonProgress[];
  locked: boolean;
}

export const learningService = {
  listMyCohorts: () => apiClient.get<MyCohortSummary[]>("/cohorts/my"),
  getCohortModules: (cohortId: string) => apiClient.get<ModuleProgress[]>(`/cohorts/${cohortId}/modules`),
};
