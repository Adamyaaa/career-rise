"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { learningService } from "@/services/learning.service";
import { mentorshipService } from "@/services/mentorship.service";
import { useAuthStore } from "@/stores/auth-store";
import { displayName, formatDate, formatTime } from "@/lib/format";
import { DashboardCohortCard } from "./dashboard-cohort-card";
import { cn } from "@/lib/utils";

interface StudentTask {
  id: string;
  title: string;
  completed: boolean;
}

export function StudentDashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const shouldReduceMotion = useReducedMotion();

  // 1. Fetch Student Cohorts
  const { data: cohorts, isLoading: isLoadingCohorts } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });

  // 2. Fetch Mentorship Track & Sessions
  const { data: mentorshipData, isLoading: isLoadingMentorship } = useQuery({
    queryKey: ["my-pro-track"],
    queryFn: mentorshipService.getMyTrack,
  });

  // Calculate real metrics from active cohorts
  const activeCohorts = (cohorts || []).filter(
    (c) => !c.enrollmentStatus || c.enrollmentStatus === "active",
  );

  const activeCohortsCount = activeCohorts.length;

  const totalLessons = activeCohorts.reduce(
    (sum, c) => sum + (c.progress?.totalLessons ?? 0),
    0,
  );
  const completedLessons = activeCohorts.reduce(
    (sum, c) => sum + (c.progress?.completedLessons ?? 0),
    0,
  );

  const overallProgressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find next upcoming scheduled mentor session
  const sessions = mentorshipData?.track?.sessions || [];
  const nextSession = sessions
    .filter((s) => s.status === "scheduled" || s.status === "requested")
    .sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    })[0];

  // 3. Today's Tasks Management (Interactive & Persisted)
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const storageKey = user ? `career_rise_tasks_${user.id}` : "career_rise_tasks_default";

  useEffect(() => {
    // Attempt to load saved task states from localStorage
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: StudentTask[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
          return;
        }
      }
    } catch {
      // Fallback to generating initial tasks
    }

    // Generate smart initial tasks from real student context
    const initialTasks: StudentTask[] = [];

    // Mentorship action items take first priority if present
    const mentorActionItems = sessions.flatMap((s) => s.actionItems || []);
    if (mentorActionItems.length > 0) {
      mentorActionItems.slice(0, 4).forEach((item) => {
        initialTasks.push({
          id: item.id || `mentor-task-${Math.random()}`,
          title: item.text,
          completed: item.completed,
        });
      });
    }

    // Supplement with active cohort tasks
    if (activeCohorts.length > 0) {
      const primaryCohort = activeCohorts[0];
      const title = primaryCohort.course.title || primaryCohort.name;

      if (initialTasks.length < 4) {
        initialTasks.push({
          id: `task-intro-${primaryCohort.id}`,
          title: `Complete: Intro to ${title}`,
          completed: true,
        });
      }
      if (initialTasks.length < 4) {
        initialTasks.push({
          id: `task-hands-on-${primaryCohort.id}`,
          title: "Build a small agent (Hands-on)",
          completed: false,
        });
      }
      if (initialTasks.length < 4) {
        initialTasks.push({
          id: `task-submit-${primaryCohort.id}`,
          title: "Submit your work",
          completed: false,
        });
      }
      if (initialTasks.length < 4) {
        initialTasks.push({
          id: `task-review-${primaryCohort.id}`,
          title: "Review mentor feedback",
          completed: false,
        });
      }
    } else {
      // Fallback for new students
      initialTasks.push(
        { id: "task-1", title: "Complete: Intro to AI Agents", completed: true },
        { id: "task-2", title: "Build a small agent (Hands-on)", completed: false },
        { id: "task-3", title: "Submit your work", completed: false },
        { id: "task-4", title: "Review mentor feedback", completed: false },
      );
    }

    setTasks(initialTasks);
  }, [user, activeCohorts.length, sessions.length, storageKey]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      );
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Ignore localStorage error
      }
      return updated;
    });
  };

  const studentName = user ? displayName(user) : "Student";

  // Subtle Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8"
    >
      {/* 1. Welcome Greeting Header (No emojis, No em dashes) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {studentName}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here is your learning progress and what is next.
        </p>
      </div>

      {/* 2. Top Summary Metric Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Cohorts Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-2xs">
          <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-primary border border-blue-100/60 shadow-2xs">
            <BookOpen className="size-6 sm:size-7" />
          </div>
          <div className="space-y-1 min-w-0">
            {isLoadingCohorts ? (
              <Skeleton className="h-8 w-14" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {activeCohortsCount}
              </div>
            )}
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">
              Active Cohorts
            </div>
          </div>
        </div>

        {/* Lessons Completed Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-2xs">
          <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-primary border border-blue-100/60 shadow-2xs">
            <CheckCircle2 className="size-6 sm:size-7" />
          </div>
          <div className="space-y-1 min-w-0">
            {isLoadingCohorts ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {completedLessons} / {totalLessons}
              </div>
            )}
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">
              Lessons Completed
            </div>
          </div>
        </div>

        {/* Overall Progress Card */}
        <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-2xs">
          <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-primary border border-blue-100/60 shadow-2xs">
            <BarChart3 className="size-6 sm:size-7" />
          </div>
          <div className="space-y-1 min-w-0">
            {isLoadingCohorts ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {overallProgressPercent}%
              </div>
            )}
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">
              Overall Progress
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: My Cohorts */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              My Cohorts
            </h2>
            <Link
              href="/student/cohorts"
              className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline transition-colors"
            >
              View all cohorts
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {isLoadingCohorts && (
            <div className="space-y-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          )}

          {!isLoadingCohorts && activeCohorts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 text-center space-y-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-semibold text-foreground">
                  No active cohorts yet
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Browse our available cohorts to enroll and begin your learning path.
                </p>
              </div>
              <Button
                render={<Link href="/student/cohorts" />}
                size="sm"
                className="rounded-xl mt-2"
              >
                Explore Cohorts
              </Button>
            </div>
          )}

          {!isLoadingCohorts && activeCohorts.length > 0 && (
            <div className="space-y-4">
              {activeCohorts.map((cohort) => (
                <DashboardCohortCard
                  key={cohort.id}
                  cohort={cohort}
                  hrefBase="/student/learning"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Tasks & Next Mentor Session */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Card 1: Today's Tasks */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <Calendar className="size-4.5 text-primary" />
                <span>Today&apos;s Tasks</span>
              </div>
              <Link
                href="/student/cohorts"
                className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors"
              >
                View all
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-start gap-3 rounded-xl p-2 -mx-2 hover:bg-muted/40 transition-colors cursor-pointer select-none group"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5"
                  />
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium transition-colors leading-relaxed",
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground group-hover:text-primary",
                    )}
                  >
                    {task.title}
                  </span>
                </label>
              ))}

              {tasks.length === 0 && (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  You are all caught up for today.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Next Mentor Session */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
              <Calendar className="size-4.5 text-primary" />
              <span>Next Mentor Session</span>
            </div>

            {isLoadingMentorship && (
              <Skeleton className="h-16 rounded-xl" />
            )}

            {!isLoadingMentorship && nextSession && (
              <Link
                href={`/student/mentorship/sessions/${nextSession.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5 transition-all hover:border-primary/40 hover:bg-muted/40 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-primary border border-blue-100/60 shadow-2xs">
                    <Calendar className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {nextSession.title || "Mentor Review"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {nextSession.scheduledAt
                        ? `${formatDate(nextSession.scheduledAt)}, ${formatTime(nextSession.scheduledAt)}`
                        : "Date to be confirmed"}
                    </div>
                  </div>
                </div>

                <ChevronRight className="size-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            )}

            {!isLoadingMentorship && !nextSession && (
              <div className="rounded-xl border border-border/60 bg-muted/15 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  No upcoming mentor session scheduled.
                </p>
                <Button
                  render={<Link href="/student/mentorship" />}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-medium w-full"
                >
                  Go to 1:1 Mentorship
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
