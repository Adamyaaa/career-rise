"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Home,
  BookOpen,
  Sparkles,
} from "lucide-react";
import type { LearnTrack } from "../data/learn-curriculum";
import { cn } from "@/lib/utils";

interface LearnSidebarProps {
  track: LearnTrack;
  activeLessonId?: string;
  completedIds: Set<string>;
  className?: string;
}

export function LearnSidebar({
  track,
  activeLessonId,
  completedIds,
  className,
}: LearnSidebarProps) {
  const allLessons = track.modules.flatMap((m) => m.lessons);
  const totalCount = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id) || completedIds.has(l.slug)).length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Estimate total time
  const remainingLessons = totalCount - completedCount;
  const remainingMinutes = remainingLessons * 6;
  const remHours = Math.floor(remainingMinutes / 60);
  const remMins = remainingMinutes % 60;
  const timeRemainingStr = remHours > 0 ? `${remHours}h ${remMins.toString().padStart(2, "0")}m left` : `${remMins}m left`;

  // Find module containing active lesson
  const activeModule = track.modules.find((m) =>
    m.lessons.some((l) => l.id === activeLessonId || l.slug === activeLessonId),
  );

  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    track.modules.forEach((m) => {
      initial[m.id] = activeModule ? m.id === activeModule.id : true;
    });
    return initial;
  });

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        "w-full flex flex-col h-full overflow-y-auto bg-card divide-y divide-border/40 select-none",
        className,
      )}
    >
      {/* Top Progress & Navigation Block */}
      <div className="p-5 flex flex-col gap-3.5">
        <Link
          href={`/student/learn/${track.slug}`}
          className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground transition-colors group"
        >
          <Home className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span>Course Home</span>
        </Link>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {percentComplete}% <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">complete</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {completedCount} / {totalCount} lessons · {timeRemainingStr}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Modules List */}
      <div className="flex flex-col py-2">
        {track.modules.map((module, modIndex) => {
          const modLessons = module.lessons;
          const modCompleted = modLessons.filter((l) => completedIds.has(l.id) || completedIds.has(l.slug)).length;
          const isOpen = openModules[module.id] ?? true;

          const modMinutes = modLessons.length * 6;
          const modHours = Math.floor(modMinutes / 60);
          const modMinsRemaining = modMinutes % 60;
          const modTimeStr = modHours > 0 ? `${modHours}h ${modMinsRemaining}m` : `${modMinsRemaining}m`;

          return (
            <div key={module.id} className="flex flex-col border-b border-border/30 last:border-b-0">
              {/* Module Accordion Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 cursor-pointer"
              >
                <div className="flex flex-col min-w-0 gap-0.5">
                  <span className="font-heading text-xs font-bold text-foreground leading-snug">
                    {module.title}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {modCompleted}/{modLessons.length} · {modTimeStr}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground/80 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {/* Module Lessons List */}
              {isOpen && (
                <div className="flex flex-col px-2 pb-2.5 gap-1">
                  {modLessons.map((lesson, lessonIndex) => {
                    const isActive = lesson.id === activeLessonId || lesson.slug === activeLessonId;
                    const isDone = completedIds.has(lesson.id) || completedIds.has(lesson.slug);

                    // Parse lesson code and clean label
                    const codeMatch = lesson.title.match(/^(\d+(\.\d+)*)\s+(.+)$/);
                    const lessonCode = codeMatch ? codeMatch[1] : `${modIndex + 1}.${lessonIndex + 1}`;
                    const lessonLabel = codeMatch ? codeMatch[3] : lesson.title;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/student/learn/${track.slug}/${lesson.slug}`}
                        className={cn(
                          "group flex items-start justify-between gap-2.5 rounded-xl px-3 py-2 text-xs transition-all",
                          isActive
                            ? "bg-primary/10 font-semibold text-primary shadow-2xs"
                            : "text-foreground/85 hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {/* Completion Indicator */}
                          <div
                            className={cn(
                              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                              isDone
                                ? "border-primary bg-primary text-primary-foreground"
                                : isActive
                                ? "border-primary/60 bg-transparent text-primary"
                                : "border-border/80 bg-transparent text-transparent group-hover:border-muted-foreground/60",
                            )}
                          >
                            {isDone ? (
                              <Check className="size-2.5 stroke-[3]" />
                            ) : (
                              <span className={cn("size-1 rounded-full", isActive ? "bg-primary" : "bg-transparent")} />
                            )}
                          </div>

                          {/* Lesson Title without harsh truncation */}
                          <div className="flex flex-col min-w-0 flex-1 leading-snug">
                            <span className="line-clamp-2 text-xs font-normal group-hover:text-foreground">
                              <span className="font-mono text-[11px] opacity-60 font-medium mr-1.5">
                                {lessonCode}
                              </span>
                              <span className={cn(isActive && "font-semibold text-primary")}>
                                {lessonLabel}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Read time badge */}
                        <span
                          className={cn(
                            "tabular-nums text-[10px] shrink-0 font-mono mt-0.5",
                            isActive ? "text-primary font-semibold" : "text-muted-foreground/70",
                          )}
                        >
                          {lesson.readTime}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
