"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  Layers,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/common/form-field";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService } from "@/services/admin.service";
import { fullName, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function getCourseThumbnailMeta(title: string) {
  const t = title.toLowerCase();
  if (t.includes("agent") || t.includes("ai") || t.includes("llm") || t.includes("genai")) {
    return {
      gradient: "from-amber-500/20 via-orange-500/15 to-primary/30",
      icon: Sparkles,
      tag: "AI & Engineering",
      pattern: "radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
    };
  }
  if (t.includes("product") || t.includes("management") || t.includes("pm")) {
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
    tag: "Cohort Track",
    pattern: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
  };
}

const emptyDraft = { courseId: "", name: "", startDate: "", endDate: "" };

export default function AdminCohortsPage() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  // Which cohort's "assign mentor" picker is open.
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState("");

  const { data: cohorts, isLoading } = useQuery({ queryKey: ["admin-cohorts"], queryFn: adminService.listCohorts });
  const { data: courses } = useQuery({ queryKey: ["admin-courses"], queryFn: adminService.listCourses });
  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: adminService.listUsers });

  const mentors = users?.filter((u) => u.role === "MENTOR" && u.isActive) ?? [];

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-cohorts"] });

  const create = useMutation({
    mutationFn: () =>
      adminService.createCohort({
        courseId: draft.courseId,
        name: draft.name.trim(),
        // Date inputs give YYYY-MM-DD; anchor to midday UTC so the stored day can't
        // shift backwards for viewers behind UTC.
        startDate: `${draft.startDate}T12:00:00.000Z`,
        endDate: `${draft.endDate}T12:00:00.000Z`,
      }),
    onSuccess: () => {
      refresh();
      toast.success("Cohort created");
      setDraft(emptyDraft);
      setAdding(false);
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't create that cohort"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminService.deleteCohort(id),
    onSuccess: () => {
      refresh();
      toast.success("Cohort deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't delete that cohort"),
  });

  const assign = useMutation({
    mutationFn: ({ cohortId, userId }: { cohortId: string; userId: string }) =>
      adminService.assignMentor(cohortId, userId),
    onSuccess: () => {
      refresh();
      toast.success("Mentor assigned");
      setAssigningTo(null);
      setMentorId("");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't assign that mentor"),
  });

  const unassign = useMutation({
    mutationFn: ({ cohortId, userId }: { cohortId: string; userId: string }) =>
      adminService.unassignMentor(cohortId, userId),
    onSuccess: () => {
      refresh();
      toast.success("Mentor removed");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't remove that mentor"),
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete cohort "${name}"? This cannot be undone.`)) remove.mutate(id);
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeading title="Cohorts" description="A run of a course, with its own mentors and students." />
        <Button onClick={() => setAdding(true)} disabled={!courses?.length} className="w-fit self-end">
          <Plus className="size-4" />
          New cohort
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/3 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && cohorts?.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No cohorts yet"
          description={courses?.length ? "Create a cohort to start enrolling students." : "Create a course first."}
        />
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {cohorts?.map((cohort) => {
          const meta = getCourseThumbnailMeta(cohort.course.title);
          const IconComponent = meta.icon;

          return (
            <div
              key={cohort.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              {/* 1. YouTube-Style Thumbnail Header */}
              <div
                className={cn(
                  "relative aspect-video w-full overflow-hidden bg-gradient-to-br p-4 flex flex-col justify-between select-none",
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
                    {cohort.name}
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
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
                    <Users className="size-3" />
                    {cohort.studentCount} {cohort.studentCount === 1 ? "student" : "students"}
                  </span>

                  <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
                    <BookOpen className="size-3" />
                    {cohort.moduleCount} {cohort.moduleCount === 1 ? "module" : "modules"}
                  </span>
                </div>
              </div>

              {/* 2. Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {cohort.course.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
                    <span>
                      {formatDate(cohort.firstClassDate ?? cohort.startDate)} – {formatDate(cohort.endDate)}
                    </span>
                  </div>

                  {/* Mentors Row */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground font-medium mr-1">Mentors:</span>
                    {cohort.mentors.length === 0 && (
                      <span className="text-xs text-muted-foreground/70 italic">None assigned</span>
                    )}
                    {cohort.mentors.map((mentor) => (
                      <span
                        key={mentor.id}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground font-medium"
                      >
                        {fullName(mentor)}
                        <button
                          onClick={() => unassign.mutate({ cohortId: cohort.id, userId: mentor.id })}
                          disabled={unassign.isPending}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                          aria-label={`Remove ${fullName(mentor)} from ${cohort.name}`}
                        >
                          <UserMinus className="size-3" />
                        </button>
                      </span>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-xs text-primary hover:bg-primary/10"
                      onClick={() => {
                        setAssigningTo(cohort.id);
                        setMentorId("");
                      }}
                    >
                      <UserPlus className="size-3 mr-1" />
                      Assign
                    </Button>
                  </div>
                </div>

                {/* 3. Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(cohort.id, cohort.name)}
                    disabled={remove.isPending}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${cohort.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>

                  <Button
                    size="sm"
                    className="rounded-xl gap-1.5 font-medium px-4 shadow-xs"
                    render={<Link href={`/mentor/cohorts/${cohort.id}`} />}
                  >
                    <Settings2 className="size-3.5" />
                    <span>Manage Cohort</span>
                    <ArrowRight className="size-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New cohort</DialogTitle>
          </DialogHeader>

          <FormField label="Course" htmlFor="courseId">
            <select
              id="courseId"
              value={draft.courseId}
              onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Select a course…</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Cohort name" htmlFor="name">
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Batch 01"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Start date" htmlFor="startDate">
              <Input
                id="startDate"
                type="date"
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="End date" htmlFor="endDate">
              <Input
                id="endDate"
                type="date"
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              />
            </FormField>
          </div>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => create.mutate()}
              disabled={
                create.isPending || !draft.courseId || !draft.name.trim() || !draft.startDate || !draft.endDate
              }
            >
              Create cohort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assigningTo !== null} onOpenChange={(open) => !open && setAssigningTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign a mentor</DialogTitle>
          </DialogHeader>

          <FormField label="Mentor" htmlFor="mentorId">
            <select
              id="mentorId"
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Select a mentor…</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {fullName(m)} — {m.email}
                </option>
              ))}
            </select>
          </FormField>

          {mentors.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No active mentors yet. Add one under People first.
            </p>
          )}

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => assigningTo && assign.mutate({ cohortId: assigningTo, userId: mentorId })}
              disabled={assign.isPending || !mentorId}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
