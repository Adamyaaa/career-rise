import { LEARN_TRACKS, GENAI_FOUNDATIONS_TRACK, type LearnTrack, type LearnModule, type LearnLesson } from "../data/learn-curriculum";

const STORAGE_KEY_PREFIX = "career_rise_learn_progress_";

export const learnCurriculumService = {
  listTracks(): LearnTrack[] {
    return LEARN_TRACKS;
  },

  getTrack(trackId: string): LearnTrack | undefined {
    return LEARN_TRACKS.find((t) => t.id === trackId || t.slug === trackId) || GENAI_FOUNDATIONS_TRACK;
  },

  getCompletedLessonIds(trackId: string): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${trackId}`);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  },

  toggleLessonCompleted(trackId: string, lessonId: string): boolean {
    if (typeof window === "undefined") return false;
    const completed = this.getCompletedLessonIds(trackId);
    let isNowCompleted = false;
    if (completed.has(lessonId)) {
      completed.delete(lessonId);
      isNowCompleted = false;
    } else {
      completed.add(lessonId);
      isNowCompleted = true;
    }
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${trackId}`, JSON.stringify(Array.from(completed)));
    return isNowCompleted;
  },

  isLessonCompleted(trackId: string, lessonId: string): boolean {
    return this.getCompletedLessonIds(trackId).has(lessonId);
  },
};
