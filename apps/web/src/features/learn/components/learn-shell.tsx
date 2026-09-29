"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  GraduationCap,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { LearnSidebar } from "./learn-sidebar";
import { LearnReader } from "./learn-reader";
import { LearnTrackOverview } from "./learn-track-overview";
import { LearnTableOfContents } from "./learn-table-of-contents";
import { learnCurriculumService } from "../services/learn-curriculum.service";
import type { TocHeading } from "../types/learn.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

interface LearnShellProps {
  cohortId: string; // Used as trackSlug
  activeLessonId?: string;
}

export function LearnShell({ cohortId: trackSlug, activeLessonId }: LearnShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Load track from standalone Learn curriculum
  const track = useMemo(() => {
    return learnCurriculumService.getTrack(trackSlug);
  }, [trackSlug]);

  // Load completion state from local store
  useEffect(() => {
    if (track) {
      setCompletedIds(learnCurriculumService.getCompletedLessonIds(track.id));
    }
  }, [track]);

  const handleToggleComplete = (lessonId: string) => {
    if (!track) return;
    const isNowDone = learnCurriculumService.toggleLessonCompleted(track.id, lessonId);
    setCompletedIds(learnCurriculumService.getCompletedLessonIds(track.id));
    toast.success(isNowDone ? "Lesson marked as complete" : "Marked as incomplete");
  };

  // Find active module and lesson
  const activeModule = useMemo(() => {
    if (!track) return undefined;
    return track.modules.find((m) =>
      m.lessons.some((l) => l.id === activeLessonId || l.slug === activeLessonId),
    );
  }, [track, activeLessonId]);

  const activeLesson = useMemo(() => {
    if (!activeModule) return undefined;
    return activeModule.lessons.find((l) => l.id === activeLessonId || l.slug === activeLessonId);
  }, [activeModule, activeLessonId]);

  // Extract headings for Table of Contents
  const headings: TocHeading[] = useMemo(() => {
    if (!activeLesson?.content) return [];
    const lines = activeLesson.content.split("\n");
    const extracted: TocHeading[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        extracted.push({
          id: slugify(text),
          text,
          level,
        });
      }
    });

    return extracted;
  }, [activeLesson?.content]);

  if (!track) {
    return (
      <div className="py-12">
        <EmptyState
          icon={GraduationCap}
          title="Track not found"
          description="Could not load the modules or study plan for this learning track."
        />
      </div>
    );
  }

  const isCurrentLessonDone = activeLesson
    ? completedIds.has(activeLesson.id) || completedIds.has(activeLesson.slug)
    : false;

  return (
    <div className="flex flex-col max-w-full">
      {/* Main 3-Pane Responsive Layout */}
      <div className="flex items-start gap-5 2xl:gap-6 w-full max-w-full relative min-w-0">
        {/* Pane 1: Left Syllabus Panel (Desktop) */}
        {sidebarOpen && (
          <aside className="hidden lg:block w-72 2xl:w-80 shrink-0 sticky top-18 h-[calc(100vh-5.5rem)] self-start">
            <div className="h-full rounded-2xl bg-card ring-1 ring-foreground/10 overflow-hidden shadow-xs flex flex-col">
              <LearnSidebar
                track={track}
                activeLessonId={activeLessonId}
                completedIds={completedIds}
                className="w-full h-full border-r-0 overflow-y-auto"
              />
            </div>
          </aside>
        )}

        {/* Mobile Slide-over Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card shadow-2xl z-10 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <span className="font-heading text-sm font-semibold text-foreground">Curriculum</span>
                <Button variant="ghost" size="icon-sm" onClick={() => setMobileDrawerOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto" onClick={() => setMobileDrawerOpen(false)}>
                <LearnSidebar
                  track={track}
                  activeLessonId={activeLessonId}
                  completedIds={completedIds}
                  className="w-full border-r-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Pane 2: Center Reading Area / Track Overview */}
        <main className="flex-1 min-w-0 max-w-full rounded-2xl bg-card ring-1 ring-foreground/10 shadow-xs p-5 sm:p-8 lg:p-10 transition-all overflow-hidden">
          {activeLesson && activeModule ? (
            <LearnReader
              track={track}
              module={activeModule}
              lesson={activeLesson}
              isCompleted={isCurrentLessonDone}
              onToggleComplete={() => handleToggleComplete(activeLesson.id)}
            />
          ) : (
            <LearnTrackOverview
              track={track}
              completedIds={completedIds}
            />
          )}
        </main>

        {/* Pane 3: Right In-Page Table of Contents (Sticky) */}
        {activeLesson && headings.length > 0 && (
          <aside
            className={cn(
              "w-56 shrink-0 sticky top-18 h-fit max-h-[calc(100vh-5.5rem)] self-start overflow-y-auto",
              sidebarOpen ? "hidden 2xl:block" : "hidden xl:block",
            )}
          >
            <LearnTableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}
