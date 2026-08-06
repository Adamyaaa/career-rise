import { mockDelay } from "@/lib/mock-delay";
import { mockProgressSignals, mockProgressHistory, mockRoadmap } from "@/lib/mock-seed";
import type { ProgressSignal, ProgressHistoryPoint, RoadmapMilestone } from "@/types/progress";

// MOCK — mirrors GET /students/:id/progress and /progress/history.
export const progressService = {
  getProgress: (
    studentId: string,
    cohortId: string,
  ): Promise<{ signals: ProgressSignal[]; overall: number }> => {
    const overall = mockProgressSignals.reduce((sum, s) => sum + s.value * s.weight, 0);
    return mockDelay({ signals: mockProgressSignals, overall });
  },

  getProgressHistory: (studentId: string, cohortId: string): Promise<ProgressHistoryPoint[]> =>
    mockDelay(mockProgressHistory),

  getRoadmap: (studentId: string, cohortId: string): Promise<RoadmapMilestone[]> =>
    mockDelay(mockRoadmap),
};
