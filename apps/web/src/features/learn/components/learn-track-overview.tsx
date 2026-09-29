"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Download, RotateCcw, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearnTrack } from "../data/learn-curriculum";
import { toast } from "sonner";

interface LearnTrackOverviewProps {
  track: LearnTrack;
  completedIds: Set<string>;
}

export function LearnTrackOverview({
  track,
  completedIds,
}: LearnTrackOverviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute stats
  const allLessons = track.modules.flatMap((m) => m.lessons);
  const completedLessons = allLessons.filter((l) => completedIds.has(l.id) || completedIds.has(l.slug));
  const totalCount = allLessons.length;
  const completedCount = completedLessons.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Time estimates
  const totalMinutes = totalCount * 6;
  const remainingMinutes = (totalCount - completedCount) * 6;

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
  };

  // Find next unfinished lesson for "Continue where you left off"
  const nextUnfinished = allLessons.find((l) => !completedIds.has(l.id) && !completedIds.has(l.slug)) ?? allLessons[0];

  const handleExportProgress = () => {
    const data = {
      trackId: track.id,
      exportedAt: new Date().toISOString(),
      completedLessonIds: Array.from(completedIds),
      totalLessons: totalCount,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-rise-learn-progress-${track.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progress exported successfully");
  };

  const handleImportProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.completedLessonIds)) {
          localStorage.setItem(
            `career_rise_learn_progress_${track.id}`,
            JSON.stringify(json.completedLessonIds),
          );
          window.location.reload();
        } else {
          toast.error("Invalid progress file format");
        }
      } catch {
        toast.error("Failed to parse progress file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-8">
      {/* Track Title & Subtitle */}
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {track.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {track.description}
        </p>
      </div>

      {/* Hero Progress Card */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-muted/30 p-6 ring-1 ring-border/60">
        {/* Circular Progress Meter */}
        <div className="relative flex size-28 shrink-0 items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-muted/60"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-primary transition-all duration-700 ease-out"
              strokeWidth="9"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - percentComplete / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-heading text-xl font-bold text-foreground">{percentComplete}%</span>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
              done
            </span>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="flex flex-1 flex-col gap-1.5 text-center sm:text-left">
          <span className="font-heading text-base font-bold text-foreground">
            {completedCount} of {totalCount} lessons completed
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {formatTime(remainingMinutes)} reading left · {formatTime(totalMinutes)} total in this topic
          </span>
        </div>
      </div>

      {/* Continue CTA Button */}
      {nextUnfinished ? (
        <div>
          <Button
            size="lg"
            render={<Link href={`/student/learn/${track.slug}/${nextUnfinished.slug}`} />}
            className="w-full sm:w-auto px-6 rounded-xl font-semibold gap-2 shadow-xs"
          >
            <span>Continue where you left off</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <CheckCircle2 className="size-5" />
          <span>You have completed all lessons in this course!</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        Open any lesson from the left syllabus — your progress automatically syncs locally as you learn.
      </p>

      {/* Offline Backup & Reset Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/60">
        <Button variant="outline" size="sm" onClick={handleExportProgress} className="rounded-xl text-xs gap-1.5">
          <Download className="size-3.5" />
          Export progress
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl text-xs gap-1.5"
        >
          <Upload className="size-3.5" />
          Import progress
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportProgress}
          accept=".json"
          className="hidden"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm("Reset local progress view?")) {
              localStorage.removeItem(`career_rise_learn_progress_${track.id}`);
              window.location.reload();
            }
          }}
          className="rounded-xl text-xs text-muted-foreground hover:text-destructive gap-1.5 ml-auto"
        >
          <RotateCcw className="size-3.5" />
          Reset view
        </Button>
      </div>
    </div>
  );
}
