export interface Course {
  id: string;
  title: string;
  description: string;
  category: string[];
}

export interface Cohort {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  startDate: string;
  endDate: string;
  studentCount: number;
  mentorNames: string[];
  status: "upcoming" | "active" | "completed";
}

export interface CourseModule {
  id: string;
  cohortId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  durationMins: number;
  completed?: boolean;
}

export type DeliveryType = "classroom" | "webinar" | "workshop" | "self_paced" | "virtual";

export interface LearningSession {
  id: string;
  lessonId: string;
  deliveryType: DeliveryType;
  scheduledAt: string | null;
  durationMins: number | null;
}

export interface Resource {
  id: string;
  lessonId: string;
  title: string;
  type: "pdf" | "video" | "link" | "slides";
  url: string;
}

export interface CohortEnrollment {
  id: string;
  studentId: string;
  cohortId: string;
  status: "active" | "withdrawn";
  enrolledAt: string;
}
