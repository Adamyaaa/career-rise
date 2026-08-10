"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/common/form-field";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

const emptyDraft = { title: "", description: "", category: "" };

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
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && courses?.length === 0 && (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create a course, then add cohorts to it." />
      )}

      <div className="mt-4 flex flex-col gap-3">
        {courses?.map((course) => (
          <Card key={course.id}>
            <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="font-heading text-sm font-medium text-foreground">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.description}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {course.category.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                  <span className="text-[11px] text-muted-foreground">
                    {course._count.cohorts} cohort{course._count.cohorts === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(course.id, course.title)}
                disabled={remove.isPending}
                className="shrink-0 text-destructive hover:bg-destructive/10"
                aria-label={`Delete ${course.title}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
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
