"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Briefcase,
  Layers,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/common/form-field";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function getCourseThumbnailMeta(title: string, category?: string[]) {
  const t = title.toLowerCase();
  if (t.includes("agent") || t.includes("ai") || t.includes("llm") || t.includes("genai")) {
    return {
      gradient: "from-amber-500/20 via-orange-500/15 to-primary/30",
      icon: Sparkles,
      tag: category?.[0] || "AI & Engineering",
      pattern: "radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
    };
  }
  if (t.includes("product") || t.includes("management") || t.includes("pm")) {
    return {
      gradient: "from-rose-500/20 via-pink-500/15 to-purple-600/30",
      icon: Briefcase,
      tag: category?.[0] || "Product & Strategy",
      pattern: "radial-gradient(circle at 80% 20%, rgba(217, 70, 239, 0.15) 0%, transparent 70%)",
    };
  }
  return {
    gradient: "from-blue-500/20 via-indigo-500/15 to-cyan-500/30",
    icon: Layers,
    tag: category?.[0] || "Course Track",
    pattern: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
  };
}

const emptyDraft = { title: "", description: "", category: "", requiresApproval: false };

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const { data: courses, isLoading } = useQuery({ queryKey: ["admin-courses"], queryFn: adminService.listCourses });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    queryClient.invalidateQueries({ queryKey: ["admin-cohorts"] });
  };

  const create = useMutation({
    mutationFn: () =>
      adminService.createCourse({
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        requiresApproval: draft.requiresApproval,
      }),
    onSuccess: () => {
      refresh();
      toast.success("Course created");
      setDraft(emptyDraft);
      setAdding(false);
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't create that course"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminService.deleteCourse(id),
    onSuccess: () => {
      refresh();
      toast.success("Course deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't delete that course"),
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) remove.mutate(id);
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeading title="Courses" description="The catalogue. Each course can run as many cohorts." />
        <Button onClick={() => setAdding(true)} className="w-fit self-end">
          <Plus className="size-4" />
          New course
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/3 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && courses?.length === 0 && (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create a course, then add cohorts to it." />
      )}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {courses?.map((course) => {
          const meta = getCourseThumbnailMeta(course.title, course.category);
          const IconComponent = meta.icon;

          return (
            <div
              key={course.id}
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

                  {course.requiresApproval && (
                    <Badge variant="outline" className="border-amber-400/40 bg-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 backdrop-blur-xs">
                      <ShieldAlert className="mr-1 size-3" /> Approval Required
                    </Badge>
                  )}
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
                    <Layers className="size-3" />
                    {course._count.cohorts} {course._count.cohorts === 1 ? "cohort" : "cohorts"}
                  </span>
                </div>
              </div>

              {/* 2. Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5 gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || "No description provided."}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                    {course.category.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px] px-2 py-0.5">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 3. Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {course._count.cohorts} active run{course._count.cohorts === 1 ? "" : "s"}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(course.id, course.title)}
                    disabled={remove.isPending}
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${course.title}`}
                  >
                    <Trash2 className="size-4" />
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
            <DialogTitle>New course</DialogTitle>
          </DialogHeader>

          <FormField label="Title" htmlFor="title">
            <Input
              id="title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Agentic AI"
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="What students will be able to do by the end."
            />
          </FormField>

          <FormField label="Categories (comma separated)" htmlFor="category">
            <Input
              id="category"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              placeholder="AI, Engineering"
            />
          </FormField>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={draft.requiresApproval}
              onChange={(e) => setDraft({ ...draft, requiresApproval: e.target.checked })}
              className="mt-1 size-4 rounded border-input text-primary focus:ring-primary"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="requiresApproval" className="text-sm font-medium leading-none">
                Requires mentor approval
              </label>
              <p className="text-[13px] text-muted-foreground">
                Students will be "pending" until a mentor or admin approves them.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !draft.title.trim()}>
              Create course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
