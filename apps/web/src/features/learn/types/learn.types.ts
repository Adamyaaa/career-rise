import type { Lesson, Module } from "@/services/learning.service";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface LearnLessonMeta {
  lessonIndex: number;
  totalInModule: number;
  moduleTitle: string;
  moduleIndex: number;
  estimatedMinutes: number;
  prevLesson?: { id: string; title: string; moduleTitle?: string };
  nextLesson?: { id: string; title: string; moduleTitle?: string };
}
