"use client";

import { useScrollToc } from "../hooks/use-scroll-toc";
import type { TocHeading } from "../types/learn.types";
import { cn } from "@/lib/utils";

interface LearnTableOfContentsProps {
  headings: TocHeading[];
  className?: string;
}

export function LearnTableOfContents({ headings, className }: LearnTableOfContentsProps) {
  const { activeId, readingProgress, scrollToHeading } = useScrollToc(headings);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Reading progress meter */}
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Reading progress</span>
          <span className="font-bold text-primary font-mono">{readingProgress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-200 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* In-page navigation list */}
      {headings.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 shadow-xs">
          <h4 className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
            On this page
          </h4>
          <nav className="flex flex-col gap-0.5 mt-1">
            {headings.map((heading, idx) => {
              const isActive = activeId === heading.id;
              return (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    "flex items-start text-left text-xs leading-relaxed py-1.5 px-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    heading.level === 3 && "pl-4 text-[11px]",
                  )}
                >
                  <span className="mr-1.5 opacity-50 font-mono">{idx + 1}.</span>
                  <span className="line-clamp-2">{heading.text}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
