"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LearnTrack, LearnModule, LearnLesson } from "../data/learn-curriculum";
import { LearnCompletionBar } from "./learn-completion-bar";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

interface LearnReaderProps {
  track: LearnTrack;
  module: LearnModule;
  lesson: LearnLesson;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

export function LearnReader({
  track,
  module,
  lesson,
  isCompleted,
  onToggleComplete,
}: LearnReaderProps) {
  const moduleIndex = track.modules.findIndex((m) => m.id === module.id);
  const lessonIndex = module.lessons.findIndex((l) => l.id === lesson.id);
  const totalInModule = module.lessons.length;

  // Flatten all lessons across modules for Prev / Next
  const flatLessons = useMemo(() => {
    return track.modules.flatMap((m) =>
      m.lessons.map((l) => ({ slug: l.slug, id: l.id, title: l.title })),
    );
  }, [track]);

  const currentIndex = flatLessons.findIndex((l) => l.id === lesson.id || l.slug === lesson.slug);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : undefined;
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : undefined;

  // Extract lesson code if present
  const codeMatch = lesson.title.match(/^(\d+(\.\d+)*)\s+(.+)$/);
  const lessonCode = codeMatch ? codeMatch[1] : `${moduleIndex + 1}.${lessonIndex + 1}`;
  const lessonLabel = codeMatch ? codeMatch[3] : lesson.title;

  return (
    <div className="w-full flex flex-col">
      {/* Top Title & Metadata */}
      <div className="flex flex-col gap-2 pb-5 border-b border-border/40">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {lesson.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
          <span className="font-medium text-foreground/80">{module.title}</span>
          <span>·</span>
          <span>{lessonCode}</span>
          <span>·</span>
          <span>Lesson {lessonIndex + 1} of {totalInModule}</span>
          <span>·</span>
          <span className="tabular-nums">{lesson.readTime} read</span>
        </div>
      </div>

      {/* Main Content / Markdown Body */}
      <article className="mt-6 space-y-6 text-foreground leading-relaxed">
        {lesson.content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h2
                  id={slugify(String(children))}
                  className="font-heading text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border/40 pb-2 scroll-mt-24"
                >
                  {children}
                </h2>
              ),
              h2: ({ children }) => (
                <h2
                  id={slugify(String(children))}
                  className="font-heading text-xl font-bold text-foreground mt-8 mb-3 scroll-mt-24"
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  id={slugify(String(children))}
                  className="font-heading text-base font-semibold text-foreground mt-6 mb-2 scroll-mt-24"
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="text-sm sm:text-base leading-relaxed text-foreground/90 my-3.5">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-outside pl-5 space-y-2 my-3 text-sm sm:text-base">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside pl-5 space-y-2 my-3 text-sm sm:text-base">{children}</ol>,
              li: ({ children }) => <li className="text-sm sm:text-base leading-relaxed text-foreground/90">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/70 bg-primary/5 px-4 py-3 rounded-r-xl italic text-sm sm:text-base text-foreground/85 my-4">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="my-6 overflow-x-auto rounded-xl border border-border/70">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-muted/70 border-b border-border/70 text-foreground font-semibold">{children}</thead>,
              tbody: ({ children }) => <tbody className="divide-y divide-border/40">{children}</tbody>,
              tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
              th: ({ children }) => <th className="px-4 py-2.5 font-semibold text-foreground">{children}</th>,
              td: ({ children }) => <td className="px-4 py-2.5 text-foreground/90">{children}</td>,
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-semibold" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="overflow-x-auto rounded-xl bg-muted/80 p-4 font-mono text-xs leading-relaxed text-foreground my-4 ring-1 ring-border/50">
                    <code>{children}</code>
                  </pre>
                );
              },
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No notes or summaries provided for this lesson yet.
          </p>
        )}
      </article>

      {/* Completion & Next/Prev Controls */}
      <LearnCompletionBar
        trackSlug={track.slug}
        isCompleted={isCompleted}
        onToggleComplete={onToggleComplete}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
      />
    </div>
  );
}
