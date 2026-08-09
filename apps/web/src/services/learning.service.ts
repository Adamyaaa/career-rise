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

export interface CohortOverview {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  course: { id: string; title: string; description: string };
  studentCount: number;
  moduleCount: number;
  lessonCount: number;
  taughtCount: number;
  cohortAvgPercent: number;
  // The signed-in student's own completion; null for mentors/admins, who have none.
  myProgressPercent: number | null;
}

export interface LessonProgress {
  id: string;
  title: string;
  order: number;
  // The student's own "I've done this".
  completed: boolean;
  // Cohort-wide: the mentor has delivered this class.
  taught: boolean;
  slidesUrl: string | null;
}

export interface ModuleProgress extends Progress {
  id: string;
  title: string;
  order: number;
  lessons: LessonProgress[];
}

export const learningService = {
  listMyCohorts: () => apiClient.get<MyCohortSummary[]>("/cohorts/my"),
  getCohortOverview: (cohortId: string) => apiClient.get<CohortOverview>(`/cohorts/${cohortId}`),
  getCohortModules: (cohortId: string) => apiClient.get<ModuleProgress[]>(`/cohorts/${cohortId}/modules`),
  markLessonComplete: (lessonId: string) => apiClient.post<{ lessonId: string; completed: boolean }>(`/lessons/${lessonId}/complete`),
  markLessonIncomplete: (lessonId: string) => apiClient.delete<{ lessonId: string; completed: boolean }>(`/lessons/${lessonId}/complete`),
};

// Mentor/admin edits to a cohort's study plan. Students never call these — the API
// rejects them by role regardless.
export const studyPlanService = {
  setLessonTaught: (lessonId: string, taught: boolean) =>
    apiClient.patch<{ lessonId: string; taught: boolean }>(`/lessons/${lessonId}/taught`, { taught }),
  setLessonSlides: (lessonId: string, slidesUrl: string) =>
    apiClient.patch<{ id: string; slidesUrl: string | null }>(`/lessons/${lessonId}/slides`, { slidesUrl }),
  createModule: (cohortId: string, title: string) =>
    apiClient.post<{ id: string; title: string; order: number }>(`/cohorts/${cohortId}/modules`, { title }),
  renameModule: (moduleId: string, title: string) =>
    apiClient.patch<{ id: string; title: string; order: number }>(`/modules/${moduleId}`, { title }),
  deleteModule: (moduleId: string) => apiClient.delete<{ id: string; deleted: true }>(`/modules/${moduleId}`),
  createLesson: (moduleId: string, title: string) =>
    apiClient.post<{ id: string; title: string; order: number }>(`/modules/${moduleId}/lessons`, { title }),
  renameLesson: (lessonId: string, title: string) =>
    apiClient.patch<{ id: string; title: string; order: number }>(`/lessons/${lessonId}`, { title }),
  deleteLesson: (lessonId: string) => apiClient.delete<{ id: string; deleted: true }>(`/lessons/${lessonId}`),
};

export interface RosterEntry {
  studentId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string; // active | withdrawn
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  percent: number;
}

export const rosterService = {
  list: (cohortId: string) => apiClient.get<RosterEntry[]>(`/cohorts/${cohortId}/students`),
  enroll: (cohortId: string, email: string) =>
    apiClient.post<{ studentId: string; email: string }>(`/cohorts/${cohortId}/students`, { email }),
  withdraw: (cohortId: string, studentId: string) =>
    apiClient.delete<{ studentId: string }>(`/cohorts/${cohortId}/students/${studentId}`),
};
