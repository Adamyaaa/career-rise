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
  // Earliest dated module — the real first class; falls back to startDate when null.
  firstClassDate: string | null;
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
  // Date of the earliest scheduled module — when classes actually begin. Null until a
  // module has a date, in which case the UI falls back to startDate.
  firstClassDate: string | null;
  // The signed-in student's own completion; null for mentors/admins, who have none.
  myProgressPercent: number | null;
}

export interface LessonProgress {
  id: string;
  title: string;
  order: number;
  // Mentor-written summary of what this class covers. "" when nothing has been written.
  content: string;
  // Both derived server-side from `scheduledAt` and `cancelled` against the clock —
  // nothing the student or the mentor ticks.
  completed: boolean;
  taught: boolean;
  // Called off by the mentor; excluded from progress on both sides of the fraction.
  cancelled: boolean;
  slides: { title: string; url: string }[];
  assignmentsUrl: string | null;
  // When the class runs — date and time. Null means unscheduled, which never completes.
  scheduledAt: string | null;
  // Mentor-set: this class expects work to be handed in.
  submissionRequired: boolean;
}

// One component of a student's progress, matching the ProgressSignal model. `active` is
// false for signals whose write path doesn't exist yet — those are shown as not-yet-
// tracked rather than counted as zero.
export interface ProgressSignalView {
  type: "evidence_submitted" | "attendance" | "review_score" | "quiz_score";
  label: string;
  description: string;
  active: boolean;
  value: number | null;
  weight: number;
  detail: { completed: number; total: number } | null;
}

export interface CohortProgress {
  // The student's own weighted figure, across active signals only.
  overallPercent: number;
  // Where the cohort is in its own schedule — the same for everyone enrolled.
  schedulePercent: number;
  elapsedLessons: number;
  totalLessons: number;
  signals: ProgressSignalView[];
}

// Modules carry no date of their own; their span comes from the classes inside them.
export interface ModuleProgress extends Progress {
  id: string;
  title: string;
  order: number;
  lessons: LessonProgress[];
}

export const learningService = {
  listCohorts: () => apiClient.get<MyCohortSummary[]>("/cohorts"),
  listMyCohorts: () => apiClient.get<MyCohortSummary[]>("/cohorts/my"),
  getCohortOverview: (cohortId: string) => apiClient.get<CohortOverview>(`/cohorts/${cohortId}`),
  getCohortModules: (cohortId: string) => apiClient.get<ModuleProgress[]>(`/cohorts/${cohortId}/modules`),
  getCohortProgress: (cohortId: string) => apiClient.get<CohortProgress>(`/cohorts/${cohortId}/progress`),
  enrollSelf: (cohortId: string) => apiClient.post<{ studentId: string; email: string; status: string }>(`/cohorts/${cohortId}/enroll-me`),
};

// Mentor/admin edits to a cohort's study plan. Students never call these — the API
// rejects them by role regardless.
export const studyPlanService = {
  setLessonCancelled: (lessonId: string, cancelled: boolean) =>
    apiClient.patch<{ lessonId: string; cancelled: boolean }>(`/lessons/${lessonId}/cancelled`, { cancelled }),
  setLessonSlides: (lessonId: string, slides: { title: string; url: string }[]) =>
    apiClient.patch<{ id: string; slides: { title: string; url: string }[] }>(`/lessons/${lessonId}/slides`, { slides }),

  setLessonAssignments: (lessonId: string, assignmentsUrl: string) =>
    apiClient.patch<{ id: string; assignmentsUrl: string | null }>(`/lessons/${lessonId}/assignments`, { assignmentsUrl }),
  createModule: (cohortId: string, title: string) =>
    apiClient.post<{ id: string; title: string; order: number }>(`/cohorts/${cohortId}/modules`, { title }),
  updateModule: (moduleId: string, title: string) =>
    apiClient.patch<{ id: string; title: string; order: number }>(`/modules/${moduleId}`, { title }),
  deleteModule: (moduleId: string) => apiClient.delete<{ id: string; deleted: true }>(`/modules/${moduleId}`),
  createLesson: (moduleId: string, title: string, scheduledAt?: string) =>
    apiClient.post<{ id: string; title: string; order: number }>(`/modules/${moduleId}/lessons`, {
      title,
      ...(scheduledAt ? { scheduledAt } : {}),
    }),
  updateLesson: (
    lessonId: string,
    title: string,
    scheduledAt?: string,
    content?: string,
    submissionRequired?: boolean,
  ) =>
    apiClient.patch<{ id: string; title: string; order: number }>(`/lessons/${lessonId}`, {
      title,
      ...(scheduledAt !== undefined ? { scheduledAt } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(submissionRequired !== undefined ? { submissionRequired } : {}),
    }),
  deleteLesson: (lessonId: string) => apiClient.delete<{ id: string; deleted: true }>(`/lessons/${lessonId}`),
};

export interface FeedbackEntry {
  id: string;
  body: string;
  createdAt: string;
  student: { id: string; email: string; firstName: string | null; lastName: string | null };
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
}

// One-way: students can only `post`. There is no student-facing read endpoint at all —
// `list` is rejected by role for anyone who isn't a mentor or admin.
export const feedbackService = {
  listForCohort: (cohortId: string) => apiClient.get<FeedbackEntry[]>(`/cohorts/${cohortId}/feedback`),
  post: (lessonId: string, body: string) =>
    apiClient.post<{ sent: true }>(`/lessons/${lessonId}/feedback`, { body }),
  delete: (feedbackId: string) => apiClient.delete<{ id: string; deleted: true }>(`/feedback/${feedbackId}`),
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
