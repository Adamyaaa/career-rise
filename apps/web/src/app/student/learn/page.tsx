"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { Button } from "@/components/ui/button";
import { learnCurriculumService } from "@/features/learn/services/learn-curriculum.service";
import type { LearnTrack } from "@/features/learn/data/learn-curriculum";
import { useAuthStore } from "@/stores/auth-store";
import { displayName } from "@/lib/format";
import { cn } from "@/lib/utils";

function getTrackThumbnailMeta(title: string, category?: string[]) {
  const t = title.toLowerCase();
  if (t.includes("agent") || t.includes("autonomous") || t.includes("ai") || t.includes("llm") || t.includes("genai")) {
    if (t.includes("agent") || t.includes("autonomous")) {
      return {
        gradient: "from-emerald-500/20 via-teal-500/15 to-cyan-600/30",
        icon: Zap,
        tag: "Autonomous Systems",
        pattern: "radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
      };
    }
    return {
      gradient: "from-blue-500/20 via-sky-500/15 to-primary/30",
      icon: Sparkles,
      tag: "AI & Engineering",
      pattern: "radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
    };
  }
  if (t.includes("product") || t.includes("management") || t.includes("pm") || t.includes("strategy")) {
    return {
      gradient: "from-rose-500/20 via-pink-500/15 to-purple-600/30",
      icon: Briefcase,
      tag: "Product & Strategy",
      pattern: "radial-gradient(circle at 80% 20%, rgba(217, 70, 239, 0.15) 0%, transparent 70%)",
    };
  }
  return {
    gradient: "from-blue-500/20 via-indigo-500/15 to-cyan-500/30",
    icon: Layers,
    tag: category?.[0] || "Learning Track",
    pattern: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
  };
}

export default function StudentLearnIndexPage() {
  const user = useAuthStore((s) => s.user);
  const tracks = learnCurriculumService.listTracks();
  const [completedMap, setCompletedMap] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    const map: Record<string, Set<string>> = {};
    tracks.forEach((track) => {
      map[track.id] = learnCurriculumService.getCompletedLessonIds(track.id);
    });
    setCompletedMap(map);
  }, [tracks]);

  return (
    <>
      <PageHeading
        title={`Hi, ${user ? displayName(user) : "student"}`}
        description="Self-paced learning tracks, conceptual blueprints, and interactive code guides."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mt-6">
        {tracks.map((track) => (
          <LearnTrackCard
            key={track.id}
            track={track}
            completedIds={completedMap[track.id] || new Set()}
          />
        ))}
      </div>
    </>
  );
}

function LearnTrackCard({
  track,
  completedIds,
}: {
  track: LearnTrack;
  completedIds: Set<string>;
}) {
  const allLessons = track.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(
    (l) => completedIds.has(l.id) || completedIds.has(l.slug),
  ).length;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Total reading time estimation (6m avg per lesson)
  const totalMinutes = totalLessons * 6;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins.toString().padStart(2, "0")}m` : `${mins}m`;

  const meta = getTrackThumbnailMeta(track.title, track.category);
  const IconComponent = meta.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {/* 1. YouTube-Style Thumbnail Header (Directly Clickable) */}
      <Link
        href={`/student/learn/${track.slug}`}
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-gradient-to-br p-4 flex flex-col justify-between select-none cursor-pointer group/thumb",
          meta.gradient,
        )}
        style={{ backgroundImage: meta.pattern }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Top Badges Row */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-2xs">
            {meta.tag}
          </span>

          <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-bold text-primary-foreground tracking-wider uppercase backdrop-blur-md shadow-2xs">
            {track.modules.length} {track.modules.length === 1 ? "module" : "modules"}
          </span>
        </div>

        {/* Center Aesthetic Topic Icon */}
        <div className="relative z-10 my-auto flex items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-background/60 backdrop-blur-md shadow-xs ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
            <IconComponent className="size-7 text-foreground/80" />
          </div>
        </div>

        {/* Bottom Metadata Badges */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
            <BookOpen className="size-3" />
            {totalLessons} lessons · {durationStr}
          </span>
        </div>

        {/* YouTube-style Progress Line at bottom edge */}
        {completedLessons > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 w-full bg-black/20">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </Link>

      {/* 2. Card Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 gap-4">
        <div className="flex flex-col gap-2">
          <Link href={`/student/learn/${track.slug}`} className="block">
            <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
              {track.title}
            </h3>
          </Link>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {track.description}
          </p>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">
              {percent === 100
                ? "Completed"
                : percent > 0
                ? `${percent}% completed`
                : "Not started"}
            </span>
            <span className="tabular-nums font-mono text-[11px]">
              {completedLessons}/{totalLessons} lessons
            </span>
          </div>
        </div>

        {/* 3. Card Footer Action */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
          <Button
            size="sm"
            className="w-full rounded-xl gap-2 font-medium shadow-xs"
            render={<Link href={`/student/learn/${track.slug}`} />}
          >
            <span>{completedLessons > 0 ? "Continue Track" : "Start Track"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
