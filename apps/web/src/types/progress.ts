export type SignalType = "attendance" | "evidence_submitted" | "review_score" | "quiz_score";

export interface ProgressSignal {
  signalType: SignalType;
  label: string;
  value: number;
  weight: number;
}

export interface ProgressHistoryPoint {
  date: string;
  value: number;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  dueDate?: string;
}
