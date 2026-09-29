"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "../types/learn.types";

export function useScrollToc(headings: TocHeading[]) {
  const [activeId, setActiveId] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Target the main article element if present for accurate reading progress
      const articleEl = document.querySelector("article");
      if (articleEl) {
        const rect = articleEl.getBoundingClientRect();
        const articleTop = rect.top + scrollY;
        const articleHeight = rect.height;
        
        // Progress starts when the article top enters viewport and completes near the bottom
        const startOffset = articleTop - 120;
        const endOffset = articleTop + articleHeight - windowHeight + 100;
        const totalDistance = Math.max(1, endOffset - startOffset);
        
        if (scrollY < startOffset) {
          setReadingProgress(0);
        } else if (scrollY >= endOffset) {
          setReadingProgress(100);
        } else {
          const progress = Math.min(100, Math.max(0, Math.round(((scrollY - startOffset) / totalDistance) * 100)));
          setReadingProgress(progress);
        }
      } else {
        const docHeight = document.documentElement.scrollHeight - windowHeight;
        if (docHeight > 0) {
          const progress = Math.min(100, Math.max(0, Math.round((scrollY / docHeight) * 100)));
          setReadingProgress(progress);
        }
      }

      // Determine active heading
      if (headings.length === 0) return;

      const headingElements = headings
        .map((h) => ({ id: h.id, el: document.getElementById(h.id) }))
        .filter((item): item is { id: string; el: HTMLElement } => item.el !== null);

      if (headingElements.length === 0) return;

      const scrollPosition = scrollY + 160; // offset below topbar and padding

      let currentActive = headingElements[0].id;
      for (const item of headingElements) {
        if (item.el.offsetTop <= scrollPosition) {
          currentActive = item.id;
        } else {
          break;
        }
      }

      setActiveId(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // offset for sticky header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return { activeId, readingProgress, scrollToHeading };
}
