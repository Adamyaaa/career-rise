import { mockDelay } from "@/lib/mock-delay";
import {
  mockAssignments,
  mockEvidence,
  mockReviews,
  mockReviewCriteria,
  currentMockStudentId,
} from "@/lib/mock-seed";
import type { Assignment, Evidence, Review, ReviewCriterion, EvidenceType } from "@/types/evidence";

// MOCK — mirrors the approved contract (POST /evidence, GET /students/:id/evidence,
// GET /mentors/me/review-queue, POST /evidence/:id/review) ahead of the Evidence and
// Reviews modules being built on the backend.
export const evidenceService = {
  listAssignments: (studentId: string = currentMockStudentId): Promise<Assignment[]> =>
    mockDelay(mockAssignments),

  getAssignment: (id: string): Promise<Assignment | undefined> =>
    mockDelay(mockAssignments.find((a) => a.id === id)),

  listEvidence: (params: { studentId?: string; cohortId?: string; status?: string } = {}): Promise<Evidence[]> =>
    mockDelay(
      mockEvidence.filter(
        (e) =>
          (!params.studentId || e.studentId === params.studentId) &&
          (!params.cohortId || e.cohortId === params.cohortId) &&
          (!params.status || e.status === params.status),
      ),
    ),

  getEvidence: (id: string): Promise<Evidence | undefined> =>
    mockDelay(mockEvidence.find((e) => e.id === id)),

  submitEvidence: (input: {
    studentId: string;
    lessonId: string;
    cohortId: string;
    evidenceType: EvidenceType;
    externalUrl?: string;
    fileName?: string;
  }): Promise<Evidence> =>
    mockDelay(
      {
        id: `ev-${Date.now()}`,
        studentName: "Aiden Cho",
        lessonTitle: "",
        submittedAt: new Date().toISOString(),
        status: "submitted",
        ...input,
      },
      700,
    ),

  listReviewQueue: (params: { cohortId?: string } = {}): Promise<Evidence[]> =>
    mockDelay(
      mockEvidence.filter(
        (e) =>
          (e.status === "submitted" || e.status === "under_review") &&
          (!params.cohortId || e.cohortId === params.cohortId),
      ),
    ),

  getReview: (evidenceId: string): Promise<Review | undefined> =>
    mockDelay(mockReviews.find((r) => r.evidenceId === evidenceId)),

  listReviewCriteria: (cohortId: string): Promise<ReviewCriterion[]> =>
    mockDelay(mockReviewCriteria.filter((c) => c.cohortId === cohortId)),

  submitReview: (input: {
    evidenceId: string;
    mentorId: string;
    mentorName: string;
    overallComment?: string;
    scores: { criterionId: string; criterionName: string; score: number; maxScore: number; comment?: string }[];
  }): Promise<Review> =>
    mockDelay({ id: `rev-${Date.now()}`, createdAt: new Date().toISOString(), ...input }, 700),
};
