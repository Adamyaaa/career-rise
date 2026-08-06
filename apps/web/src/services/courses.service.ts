import { mockDelay } from "@/lib/mock-delay";
import {
  mockCourses,
  mockCohorts,
  mockModules,
  mockLessons,
  mockSessions,
  mockResources,
  currentMockStudentId,
} from "@/lib/mock-seed";
import type { Course, Cohort, CourseModule, Lesson, LearningSession, Resource } from "@/types/course";

// MOCK — no backend Courses/Cohorts module yet (Phase 4 only shipped auth). Shape
// mirrors the approved API contract (GET /courses, GET /cohorts/:id, etc.) so
// swapping these for real apiClient calls later is a same-signature change.
export const coursesService = {
  listCourses: (): Promise<Course[]> => mockDelay(mockCourses),

  getCourse: (id: string): Promise<Course | undefined> =>
    mockDelay(mockCourses.find((c) => c.id === id)),

  listCohorts: (params?: { courseId?: string }): Promise<Cohort[]> =>
    mockDelay(mockCohorts.filter((c) => !params?.courseId || c.courseId === params.courseId)),

  getCohort: (id: string): Promise<Cohort | undefined> =>
    mockDelay(mockCohorts.find((c) => c.id === id)),

  // In the real API this would be derived from CohortEnrollment rows scoped to the
  // authenticated student — for the demo, stu-1 is enrolled in cohort-1.
  listMyCohorts: (studentId: string = currentMockStudentId): Promise<Cohort[]> =>
    mockDelay(mockCohorts.filter((c) => (studentId === currentMockStudentId ? c.id === "cohort-1" : false))),

  listModules: (cohortId: string): Promise<CourseModule[]> =>
    mockDelay(mockModules.filter((m) => m.cohortId === cohortId).sort((a, b) => a.order - b.order)),

  listLessons: (moduleId: string): Promise<Lesson[]> =>
    mockDelay(mockLessons.filter((l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order)),

  getLesson: (id: string): Promise<Lesson | undefined> =>
    mockDelay(mockLessons.find((l) => l.id === id)),

  getSessionForLesson: (lessonId: string): Promise<LearningSession | undefined> =>
    mockDelay(mockSessions.find((s) => s.lessonId === lessonId)),

  listUpcomingSessions: (cohortId: string): Promise<LearningSession[]> =>
    mockDelay(mockSessions.filter((s) => s.scheduledAt !== null)),

  listResources: (lessonId: string): Promise<Resource[]> =>
    mockDelay(mockResources.filter((r) => r.lessonId === lessonId)),

  listAllResources: (cohortId: string): Promise<(Resource & { lessonTitle: string })[]> => {
    const lessonIds = new Set(
      mockLessons
        .filter((l) => mockModules.some((m) => m.id === l.moduleId && m.cohortId === cohortId))
        .map((l) => l.id),
    );
    return mockDelay(
      mockResources
        .filter((r) => lessonIds.has(r.lessonId))
        .map((r) => ({ ...r, lessonTitle: mockLessons.find((l) => l.id === r.lessonId)?.title ?? "" })),
    );
  },
};
