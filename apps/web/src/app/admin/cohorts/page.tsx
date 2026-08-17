"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Layers, Plus, Settings2, Trash2, UserMinus, UserPlus } from "lucide-react";
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
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {cohorts?.map((cohort) => (
          <div
            key={cohort.id}
            className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
          >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Layers className="size-4" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Badge variant="secondary" className="w-fit text-[10px] uppercase">
                    {cohort.name}
                  </Badge>
                  <p className="font-heading text-base leading-snug font-medium text-foreground">
                    {cohort.course.title}
                  </p>
                  {/* Start shown from the first scheduled class when there is one, so this
                      agrees with the cohort header the mentors and students see. */}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(cohort.firstClassDate ?? cohort.startDate)} – {formatDate(cohort.endDate)} ·{" "}
                    {cohort.studentCount} student{cohort.studentCount === 1 ? "" : "s"} · {cohort.moduleCount} module
                    {cohort.moduleCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {/* Study plan, students, feedback and announcements all live on the
                      cohort detail page, which admins can now open too. */}
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/mentor/cohorts/${cohort.id}`} />}
                  >
                    <Settings2 className="size-3.5" />
                    Manage
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(cohort.id, cohort.name)}
                    disabled={remove.isPending}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${cohort.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">Mentors:</span>
                {cohort.mentors.length === 0 && <span className="text-xs text-muted-foreground/70">none yet</span>}
                {cohort.mentors.map((mentor) => (
                  <span
                    key={mentor.id}
                    className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground"
                  >
                    {fullName(mentor)}
                    <button
                      onClick={() => unassign.mutate({ cohortId: cohort.id, userId: mentor.id })}
                      disabled={unassign.isPending}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${fullName(mentor)} from ${cohort.name}`}
                    >
                      <UserMinus className="size-3" />
                    </button>
                  </span>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAssigningTo(cohort.id);
                    setMentorId("");
                  }}
                >
                  <UserPlus className="size-3.5" />
                  Assign
                </Button>
              </div>
          </div>
        ))}
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
