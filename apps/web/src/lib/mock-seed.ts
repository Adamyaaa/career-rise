// Central, cross-referenced mock dataset consumed by every mock service in
// src/services/*. Keeping it in one place means an Evidence.studentId, a
// Lesson.id, etc. always resolve to something else in the seed — the same
// invariant a real relational backend would guarantee.
import type { Course, Cohort, CourseModule, Lesson, LearningSession, Resource } from "@/types/course";
import type { Assignment, Evidence, Review, ReviewCriterion } from "@/types/evidence";
import type { AttendanceRecord } from "@/types/attendance";
import type { ProgressSignal, ProgressHistoryPoint, RoadmapMilestone } from "@/types/progress";
import type { Notification, Announcement } from "@/types/notification";
import type { MentorProfile } from "@/types/user";

export const mockStudents = [
  { id: "stu-1", name: "Aiden Cho", email: "aiden@career-rise.test" },
  { id: "stu-2", name: "Priya Nair", email: "priya@career-rise.test" },
  { id: "stu-3", name: "Marcus Webb", email: "marcus@career-rise.test" },
  { id: "stu-4", name: "Sofia Alvarez", email: "sofia@career-rise.test" },
  { id: "stu-5", name: "Daniel Kim", email: "daniel@career-rise.test" },
  { id: "stu-6", name: "Grace Liu", email: "grace@career-rise.test" },
  { id: "stu-7", name: "Omar Farouk", email: "omar@career-rise.test" },
  { id: "stu-8", name: "Emma Rodriguez", email: "emma@career-rise.test" },
];

// The "current student" the Student area is demoed as.
export const currentMockStudentId = "stu-1";

export const mockMentors: MentorProfile[] = [
  {
    userId: "men-1",
    name: "Aakshay Sharma",
    specializations: ["agentic-ai", "llm-systems"],
    capacity: 15,
    activeStudentCount: 8,
  },
  {
    userId: "men-2",
    name: "James Okafor",
    specializations: ["agentic-ai", "backend"],
    capacity: 12,
    activeStudentCount: 6,
  },
];

export const currentMockMentorId = "men-1";

export const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "Agentic AI",
    description:
      "Design, build, and evaluate autonomous AI agents — from single-tool prompting to coordinated multi-agent systems.",
    category: ["agentic-ai"],
  },
];

export const mockCohorts: Cohort[] = [
  {
    id: "cohort-1",
    courseId: "course-1",
    courseTitle: "Agentic AI",
    name: "Agentic AI · Cohort 3",
    startDate: "2026-07-06",
    endDate: "2026-09-28",
    studentCount: mockStudents.length,
    mentorNames: [mockMentors[0].name],
    status: "active",
  },
  {
    id: "cohort-2",
    courseId: "course-1",
    courseTitle: "Agentic AI",
    name: "Agentic AI · Cohort 4",
    startDate: "2026-10-05",
    endDate: "2026-12-21",
    studentCount: 0,
    mentorNames: [mockMentors[1].name],
    status: "upcoming",
  },
];

export const mockModules: CourseModule[] = [
  { id: "mod-1", cohortId: "cohort-1", title: "Foundations of Agents", order: 1 },
  { id: "mod-2", cohortId: "cohort-1", title: "Tool Use & Memory", order: 2 },
  { id: "mod-3", cohortId: "cohort-1", title: "Multi-Agent Systems", order: 3 },
  // Mirrors the real seeded Module (prisma/seed.ts) so the lesson page below has
  // mock title/content to render while its Course Material section pulls the
  // real uploaded SharedFile rows for this same (real) lesson id.
  { id: "cmshb3b9m000cc7bgjzpy6c95", cohortId: "cmshb3b8u0006c7bgzw3b91iv", title: "Foundations", order: 1 },
];

export const mockLessons: Lesson[] = [
  { id: "lesson-1", moduleId: "mod-1", title: "What is an agent?", content: "An introduction to agentic loops: perceive, reason, act.", order: 1, durationMins: 45, completed: true },
  { id: "lesson-2", moduleId: "mod-1", title: "Prompting for agentic behavior", content: "Designing prompts that reliably produce planning and tool-use behavior.", order: 2, durationMins: 60, completed: true },
  { id: "lesson-3", moduleId: "mod-2", title: "Building your first agent", content: "Wire up a tool-using agent loop end to end.", order: 1, durationMins: 90, completed: false },
  { id: "lesson-4", moduleId: "mod-2", title: "Tool use & memory", content: "Give your agent persistent memory and structured tool calls.", order: 2, durationMins: 75, completed: false },
  { id: "lesson-5", moduleId: "mod-3", title: "Coordinating multiple agents", content: "Patterns for orchestrating several agents on one task.", order: 1, durationMins: 60, completed: false },
  { id: "lesson-6", moduleId: "mod-3", title: "Deploying agentic systems", content: "Taking a multi-agent system from notebook to production.", order: 2, durationMins: 60, completed: false },
  // Real seeded lesson id — see note on mockModules above.
  { id: "cmshb3b9u000ec7bg8w66uak8", moduleId: "cmshb3b9m000cc7bgjzpy6c95", title: "What is an agent?", content: "Lesson content for \"What is an agent?\" goes here.", order: 1, durationMins: 45, completed: false },
];

const deliveryTypes: LearningSession["deliveryType"][] = [
  "classroom",
  "webinar",
  "workshop",
  "self_paced",
  "virtual",
];

export const mockSessions: LearningSession[] = mockLessons.map((lesson, i) => ({
  id: `session-${i + 1}`,
  lessonId: lesson.id,
  deliveryType: deliveryTypes[i % deliveryTypes.length],
  scheduledAt: i < 2 ? `2026-07-${14 + i * 7}T17:00:00Z` : i === 2 ? "2026-08-04T17:00:00Z" : null,
  durationMins: lesson.durationMins,
}));

export const mockResources: Resource[] = mockLessons.flatMap((lesson) => [
  { id: `${lesson.id}-res-1`, lessonId: lesson.id, title: `${lesson.title} — slides`, type: "slides", url: "#" },
  { id: `${lesson.id}-res-2`, lessonId: lesson.id, title: `${lesson.title} — recording`, type: "video", url: "#" },
]);

export const mockReviewCriteria: ReviewCriterion[] = [
  { id: "crit-1", cohortId: "cohort-1", name: "Correctness", weight: 0.4, order: 1 },
  { id: "crit-2", cohortId: "cohort-1", name: "Code quality", weight: 0.35, order: 2 },
  { id: "crit-3", cohortId: "cohort-1", name: "Documentation", weight: 0.25, order: 3 },
];

export const mockAssignments: Assignment[] = mockLessons.map((lesson, i) => ({
  id: `assign-${i + 1}`,
  lessonId: lesson.id,
  lessonTitle: lesson.title,
  courseId: "course-1",
  cohortId: "cohort-1",
  title: `Submit evidence: ${lesson.title}`,
  description: `Complete the activity for "${lesson.title}" and submit evidence of your work.`,
  dueDate: `2026-0${7 + Math.floor(i / 2)}-${(15 + (i % 2) * 10).toString().padStart(2, "0")}`,
  status: i === 0 || i === 1 ? "reviewed" : i === 2 ? "submitted" : i === 3 ? "in_progress" : "not_started",
  expectedEvidenceType: i % 2 === 0 ? "github_repo" : "drive_link",
}));

export const mockEvidence: Evidence[] = [
  {
    id: "ev-1",
    studentId: "stu-1",
    studentName: "Aiden Cho",
    lessonId: "lesson-1",
    lessonTitle: "What is an agent?",
    cohortId: "cohort-1",
    evidenceType: "drive_link",
    externalUrl: "https://drive.example.com/aiden/lesson-1-notes",
    submittedAt: "2026-07-15T10:20:00Z",
    status: "reviewed",
  },
  {
    id: "ev-2",
    studentId: "stu-1",
    studentName: "Aiden Cho",
    lessonId: "lesson-2",
    lessonTitle: "Prompting for agentic behavior",
    cohortId: "cohort-1",
    evidenceType: "github_repo",
    externalUrl: "https://github.com/aiden-cho/agentic-prompts",
    submittedAt: "2026-07-22T14:05:00Z",
    status: "reviewed",
  },
  {
    id: "ev-3",
    studentId: "stu-1",
    studentName: "Aiden Cho",
    lessonId: "lesson-3",
    lessonTitle: "Building your first agent",
    cohortId: "cohort-1",
    evidenceType: "github_repo",
    externalUrl: "https://github.com/aiden-cho/first-agent",
    submittedAt: "2026-08-02T09:40:00Z",
    status: "under_review",
  },
  {
    id: "ev-4",
    studentId: "stu-2",
    studentName: "Priya Nair",
    lessonId: "lesson-3",
    lessonTitle: "Building your first agent",
    cohortId: "cohort-1",
    evidenceType: "github_repo",
    externalUrl: "https://github.com/priya-nair/first-agent",
    submittedAt: "2026-08-01T16:12:00Z",
    status: "submitted",
  },
  {
    id: "ev-5",
    studentId: "stu-3",
    studentName: "Marcus Webb",
    lessonId: "lesson-2",
    lessonTitle: "Prompting for agentic behavior",
    cohortId: "cohort-1",
    evidenceType: "pdf",
    fileName: "marcus-prompting-notes.pdf",
    submittedAt: "2026-07-23T11:00:00Z",
    status: "submitted",
  },
  {
    id: "ev-6",
    studentId: "stu-4",
    studentName: "Sofia Alvarez",
    lessonId: "lesson-4",
    lessonTitle: "Tool use & memory",
    cohortId: "cohort-1",
    evidenceType: "figma",
    externalUrl: "https://figma.com/sofia/agent-memory-design",
    submittedAt: "2026-08-03T08:30:00Z",
    status: "grading_failed",
  },
];

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    evidenceId: "ev-1",
    mentorId: "men-1",
    mentorName: "Aakshay Sharma",
    overallComment: "Clear grasp of the perceive-reason-act loop. Nice use of your own examples.",
    scores: [
      { criterionId: "crit-1", criterionName: "Correctness", score: 9, maxScore: 10 },
      { criterionId: "crit-2", criterionName: "Code quality", score: 8, maxScore: 10 },
      { criterionId: "crit-3", criterionName: "Documentation", score: 9, maxScore: 10 },
    ],
    createdAt: "2026-07-16T13:00:00Z",
  },
  {
    id: "rev-2",
    evidenceId: "ev-2",
    mentorId: "men-1",
    mentorName: "Aakshay Sharma",
    overallComment: "Good prompt structure. Try adding few-shot examples to stabilize tool selection next time.",
    scores: [
      { criterionId: "crit-1", criterionName: "Correctness", score: 8, maxScore: 10 },
      { criterionId: "crit-2", criterionName: "Code quality", score: 7, maxScore: 10 },
      { criterionId: "crit-3", criterionName: "Documentation", score: 8, maxScore: 10 },
    ],
    createdAt: "2026-07-24T09:15:00Z",
  },
];

export const mockAttendance: AttendanceRecord[] = mockStudents.flatMap((student, i) => [
  {
    id: `att-${student.id}-s1`,
    learningSessionId: "session-1",
    sessionTitle: "What is an agent?",
    studentId: student.id,
    studentName: student.name,
    cohortId: "cohort-1",
    status: i === 5 ? "late" : i === 7 ? "absent" : "present",
    markedAt: "2026-07-14T17:05:00Z",
  },
  {
    id: `att-${student.id}-s2`,
    learningSessionId: "session-2",
    sessionTitle: "Prompting for agentic behavior",
    studentId: student.id,
    studentName: student.name,
    cohortId: "cohort-1",
    status: i === 2 ? "excused" : i === 7 ? "absent" : "present",
    markedAt: "2026-07-21T17:05:00Z",
  },
]);

export const mockProgressSignals: ProgressSignal[] = [
  { signalType: "attendance", label: "Attendance", value: 0.92, weight: 0.25 },
  { signalType: "evidence_submitted", label: "Evidence submitted", value: 0.75, weight: 0.3 },
  { signalType: "review_score", label: "Review scores", value: 0.85, weight: 0.35 },
  { signalType: "quiz_score", label: "Quiz scores", value: 0.7, weight: 0.1 },
];

export const mockProgressHistory: ProgressHistoryPoint[] = [
  { date: "Week 1", value: 0.1 },
  { date: "Week 2", value: 0.22 },
  { date: "Week 3", value: 0.38 },
  { date: "Week 4", value: 0.51 },
  { date: "Week 5", value: 0.6 },
  { date: "Week 6", value: 0.68 },
  { date: "Week 7", value: 0.78 },
];

export const mockRoadmap: RoadmapMilestone[] = [
  { id: "ms-1", title: "Onboarding", description: "Account setup, cohort orientation.", status: "completed", dueDate: "2026-07-08" },
  { id: "ms-2", title: "Foundations of Agents", description: "Core agentic loop concepts and prompting.", status: "completed", dueDate: "2026-07-24" },
  { id: "ms-3", title: "Tool Use & Memory", description: "Build a tool-using agent with persistent memory.", status: "current", dueDate: "2026-08-14" },
  { id: "ms-4", title: "Multi-Agent Systems", description: "Coordinate multiple agents on one task.", status: "upcoming", dueDate: "2026-09-04" },
  { id: "ms-5", title: "Capstone", description: "Ship a deployed agentic system as your final evidence.", status: "upcoming", dueDate: "2026-09-25" },
];

export const mockNotifications: Notification[] = [
  { id: "notif-1", title: "Evidence reviewed", body: "Your submission for \"Prompting for agentic behavior\" was reviewed by Aakshay Sharma.", read: false, createdAt: "2026-07-24T09:16:00Z", type: "review" },
  { id: "notif-2", title: "New announcement", body: "Aakshay Sharma posted an announcement in Agentic AI · Cohort 3.", read: false, createdAt: "2026-08-01T12:00:00Z", type: "announcement" },
  { id: "notif-3", title: "Attendance marked", body: "You were marked present for \"Prompting for agentic behavior.\"", read: true, createdAt: "2026-07-21T17:10:00Z", type: "attendance" },
  { id: "notif-4", title: "Evidence under review", body: "Your submission for \"Building your first agent\" is now under review.", read: true, createdAt: "2026-08-02T09:41:00Z", type: "review" },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    cohortId: "cohort-1",
    cohortName: "Agentic AI · Cohort 3",
    title: "Office hours moved to Thursdays",
    body: "Starting next week, weekly office hours move from Wednesday to Thursday 4–5pm to avoid the module 2 workshop conflict.",
    authorName: "Aakshay Sharma",
    createdAt: "2026-08-01T12:00:00Z",
  },
  {
    id: "ann-2",
    cohortId: "cohort-1",
    cohortName: "Agentic AI · Cohort 3",
    title: "Module 2 evidence deadline extended",
    body: "The deadline for \"Building your first agent\" evidence is extended by 3 days given the tooling outage last week.",
    authorName: "James Okafor",
    createdAt: "2026-07-30T15:30:00Z",
  },
];
