export type EvidenceType = "github_repo" | "pdf" | "figma" | "drive_link" | "video";
export type EvidenceStatus = "submitted" | "under_review" | "reviewed" | "grading_failed";

export interface Evidence {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  cohortId: string;
  evidenceType: EvidenceType;
  externalUrl?: string;
  fileName?: string;
  submittedAt: string;
  status: EvidenceStatus;
}

export interface Assignment {
  id: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  cohortId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "not_started" | "in_progress" | "submitted" | "reviewed";
  expectedEvidenceType: EvidenceType;
}

export interface ReviewCriterion {
  id: string;
  cohortId: string;
  name: string;
  weight: number;
  order: number;
}

export interface ReviewScore {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  comment?: string;
}

export interface Review {
  id: string;
  evidenceId: string;
  mentorId: string;
  mentorName: string;
  overallComment?: string;
  scores: ReviewScore[];
  createdAt: string;
}
