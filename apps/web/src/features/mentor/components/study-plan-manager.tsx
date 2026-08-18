"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlignLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  Pencil,
  Plus,
  Presentation,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FormField } from "@/components/common/form-field";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { studyPlanService } from "@/services/learning.service";
import { lessonBrowserService } from "@/services/lesson-browser.service";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/format";
import { toast } from "sonner";

type Editor =
  | { kind: "slides"; lessonId: string; value: { title: string; url: string }[] }
  | { kind: "assignments"; lessonId: string; value: string }
  | { kind: "module"; moduleId: string; value: string }
  | { kind: "lesson"; lessonId: string; value: string; date: string }
  | { kind: "summary"; lessonId: string; title: string; value: string }
  | { kind: "new-module"; value: string }
  | { kind: "new-lesson"; moduleId: string; value: string; date: string };

// Classes carry the schedule now — modules are just containers.
const hasDate = (editor: Editor): editor is Extract<Editor, { date: string }> =>
  editor.kind === "lesson" || editor.kind === "new-lesson";

const EDITOR_COPY: Record<Editor["kind"], { title: string; label: string; placeholder: string }> = {
  slides: { title: "Slides links", label: "Slide links", placeholder: "" },
  assignments: { title: "Assignments link", label: "Google Drive link", placeholder: "https://drive.google.com/..." },
  module: { title: "Rename module", label: "Module title", placeholder: "e.g. Foundations" },
  lesson: { title: "Edit class", label: "Class title", placeholder: "e.g. What is an agent?" },
  summary: {
    title: "Class summary",
    label: "What this class covers",
    placeholder: "A short outline of the class — students see this on the class page.",
  },
  "new-module": { title: "Add a module", label: "Module title", placeholder: "e.g. Multi-Agent Orchestration" },
  "new-lesson": { title: "Add a class", label: "Class title", placeholder: "e.g. Planning & reasoning loops" },
};

export function StudyPlanManager({ cohortId }: { cohortId: string }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);

  const { data: modules, isLoading } = useQuery({
    queryKey: ["cohort-study-plan", cohortId],
    queryFn: () => lessonBrowserService.listModules(cohortId),
  });

  // Every mutation here changes what students see, so their view is invalidated too.
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["cohort-study-plan", cohortId] });
    queryClient.invalidateQueries({ queryKey: ["cohort-modules", cohortId] });
    queryClient.invalidateQueries({ queryKey: ["cohort-overview", cohortId] });
    queryClient.invalidateQueries({ queryKey: ["cohort-progress", cohortId] });
    queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
  };

  const mutate = useMutation({
    mutationFn: (run: () => Promise<unknown>) => run(),
    onSuccess: () => {
      refresh();
      setEditor(null);
    },
    onError: (err: Error) => toast.error(err.message || "Something went wrong — try again"),
  });

  const run = (fn: () => Promise<unknown>) => mutate.mutate(fn);

  const handleSave = () => {
    if (!editor) return;
    
    if (editor.kind === "slides") {
      return run(() => studyPlanService.setLessonSlides(editor.lessonId, editor.value));
    }

    const value = editor.value.trim();
    // Slides/assignments links and the summary may all be cleared by emptying the field;
    // everything else is a title and must have something in it.
    const optional = editor.kind === "assignments" || editor.kind === "summary";
    if (!optional && !value) {
      toast.error("Please enter a title");
      return;
    }

    switch (editor.kind) {
      case "assignments":
        return run(() => studyPlanService.setLessonAssignments(editor.lessonId, editor.value));
      case "module":
        return run(() => studyPlanService.updateModule(editor.moduleId, value));
      case "lesson":
        return run(() => studyPlanService.updateLesson(editor.lessonId, value, editor.date));
      // Title is sent unchanged — the endpoint always expects one, and only the summary
      // is being edited here.
      case "summary":
        return run(() => studyPlanService.updateLesson(editor.lessonId, editor.title, undefined, value));
      case "new-module":
        return run(() => studyPlanService.createModule(cohortId, value));
      case "new-lesson":
        return run(() => studyPlanService.createLesson(editor.moduleId, value, editor.date));
    }
  };

  const handleDeleteModule = (moduleId: string, title: string) => {
    if (confirm(`Delete "${title}" and all its classes? This cannot be undone.`)) {
      run(() => studyPlanService.deleteModule(moduleId));
    }
  };

  const handleDeleteLesson = (lessonId: string, title: string) => {
    if (confirm(`Delete the class "${title}"? This cannot be undone.`)) {
      run(() => studyPlanService.deleteLesson(lessonId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const allLessons = modules?.flatMap((m) => m.lessons) ?? [];
  const counted = allLessons.filter((l) => !l.cancelled);
  const taughtCount = counted.filter((l) => l.taught).length;
  const taughtPercent = counted.length === 0 ? 0 : Math.round((taughtCount / counted.length) * 100);
  const copy = editor ? EDITOR_COPY[editor.kind] : null;

  return (
    <>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm ring-1 ring-foreground/10">
          <div className="flex items-baseline justify-between">
            <p className="font-heading text-sm font-medium text-foreground">
              {taughtCount} of {counted.length} classes delivered
            </p>
            <span className="text-xs text-muted-foreground">{taughtPercent}%</span>
          </div>
          <Progress value={taughtPercent} />
          <p className="text-xs text-muted-foreground">
            Counted from each class&apos;s scheduled time — cancel a class if it isn&apos;t going ahead.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setEditor({ kind: "new-module", value: "" })}
          className="h-auto w-full rounded-2xl border-dashed py-5"
        >
          <Plus className="size-4" />
          Add a module
        </Button>

        {modules?.length === 0 && (
          <EmptyState
            icon={Presentation}
            title="No modules yet"
            description="Add your first module to start building this cohort's study plan."
          />
        )}

        <div className="flex flex-col gap-4">
          {modules?.map((module, index) => {
            const isExpanded = expanded === module.id;
            const moduleCounted = module.lessons.filter((l) => !l.cancelled);
            const moduleTaught = moduleCounted.filter((l) => l.taught).length;
            const modulePercent =
              moduleCounted.length === 0 ? 0 : Math.round((moduleTaught / moduleCounted.length) * 100);

            return (
              <div key={module.id} className="flex flex-col rounded-2xl bg-card ring-1 ring-foreground/10">
                <div className="flex items-start gap-3 p-5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Layers className="size-4" />
                  </span>

                  <button
                    onClick={() => setExpanded(isExpanded ? null : module.id)}
                    className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                  >
                    <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Module {index + 1}
                    </span>
                    <span className="font-heading text-base leading-snug font-medium text-foreground">
                      {module.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {moduleTaught}/{moduleCounted.length} delivered
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditor({ kind: "module", moduleId: module.id, value: module.title })}
                      aria-label={`Rename ${module.title}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteModule(module.id, module.title)}
                      className="text-destructive hover:bg-destructive/10"
                      aria-label={`Delete ${module.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setExpanded(isExpanded ? null : module.id)}
                      aria-label="Toggle classes"
                    >
                      <ChevronDown className={cn("size-4 transition-transform", isExpanded && "rotate-180")} />
                    </Button>
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <Progress value={modulePercent} />
                </div>

                {isExpanded && (
                  <div className="flex flex-col gap-3 border-t border-border/60 p-5">
                    {module.lessons.map((lesson, i) => (
                      <div
                        key={lesson.id}
                        className={cn(
                          "flex flex-col gap-3 rounded-xl bg-background p-4 ring-1",
                          lesson.cancelled
                            ? "opacity-60 ring-destructive/25"
                            : lesson.taught
                              ? "ring-primary/25"
                              : "ring-foreground/10",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                              lesson.cancelled
                                ? "bg-destructive/10 text-destructive"
                                : lesson.taught
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {lesson.cancelled ? (
                              <XCircle className="size-3.5" />
                            ) : lesson.taught ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <Circle className="size-3.5" />
                            )}
                          </span>

                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                Class {i + 1}
                              </span>
                              {lesson.cancelled && (
                                <Badge variant="outline" className="border-destructive/40 text-[10px] text-destructive">
                                  Cancelled
                                </Badge>
                              )}
                              {lesson.submissionRequired && (
                                <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
                                  Submission required
                                </Badge>
                              )}
                            </div>

                            <span
                              className={cn(
                                "font-heading text-sm font-medium",
                                lesson.cancelled && "line-through",
                                lesson.taught ? "text-muted-foreground" : "text-foreground",
                              )}
                            >
                              {lesson.title}
                            </span>

                            {lesson.scheduledAt ? (
                              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5 shrink-0" />
                                  {formatDate(lesson.scheduledAt)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="size-3.5 shrink-0" />
                                  {formatTime(lesson.scheduledAt)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/60">No date set</span>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setEditor({
                                  kind: "lesson",
                                  lessonId: lesson.id,
                                  value: lesson.title,
                                  // <input type="datetime-local"> wants YYYY-MM-DDTHH:mm.
                                  date: lesson.scheduledAt ? lesson.scheduledAt.slice(0, 16) : "",
                                })
                              }
                              aria-label={`Edit ${lesson.title}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                              className="text-destructive hover:bg-destructive/10"
                              aria-label={`Delete ${lesson.title}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                          <SlidesButton
                            slides={lesson.slides}
                            onEdit={() =>
                              setEditor({ kind: "slides", lessonId: lesson.id, value: lesson.slides ?? [] })
                            }
                          />
                          <MaterialButton
                            icon={FileText}
                            label="assignments"
                            url={lesson.assignmentsUrl}
                            onEdit={() =>
                              setEditor({
                                kind: "assignments",
                                lessonId: lesson.id,
                                value: lesson.assignmentsUrl ?? "",
                              })
                            }
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setEditor({
                                kind: "summary",
                                lessonId: lesson.id,
                                title: lesson.title,
                                value: lesson.content ?? "",
                              })
                            }
                          >
                            <AlignLeft className="size-3.5" />
                            {lesson.content ? "Edit summary" : "Add summary"}
                          </Button>

                          {/* Drives the student's "work submitted" progress signal, so the
                              same wording appears on their side of the class. */}
                          <Button
                            variant={lesson.submissionRequired ? "secondary" : "outline"}
                            size="sm"
                            onClick={() =>
                              run(() =>
                                studyPlanService.updateLesson(
                                  lesson.id,
                                  lesson.title,
                                  undefined,
                                  undefined,
                                  !lesson.submissionRequired,
                                ),
                              )
                            }
                            aria-pressed={lesson.submissionRequired}
                          >
                            <Upload className="size-3.5" />
                            {lesson.submissionRequired ? "Submission required" : "No submission"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => run(() => studyPlanService.setLessonCancelled(lesson.id, !lesson.cancelled))}
                            className={cn("ml-auto", lesson.cancelled ? "text-primary" : "text-destructive")}
                          >
                            <XCircle className="size-3.5" />
                            {lesson.cancelled ? "Restore class" : "Cancel class"}
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => setEditor({ kind: "new-lesson", moduleId: module.id, value: "", date: "" })}
                      className="h-auto w-full rounded-xl border-dashed py-3"
                    >
                      <Plus className="size-3.5" />
                      Add a class
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy?.title}</DialogTitle>
          </DialogHeader>

          {editor?.kind === "slides" ? (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-foreground">Links</span>
              {editor.value.map((slide, i) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    value={slide.title} 
                    onChange={(e) => {
                      const newSlides = [...editor.value];
                      newSlides[i].title = e.target.value;
                      setEditor({ ...editor, value: newSlides });
                    }} 
                    placeholder="Title" 
                    className="flex-1"
                  />
                  <Input 
                    type="url" 
                    value={slide.url} 
                    onChange={(e) => {
                      const newSlides = [...editor.value];
                      newSlides[i].url = e.target.value;
                      setEditor({ ...editor, value: newSlides });
                    }} 
                    placeholder="https://..." 
                    className="flex-[2]"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => {
                    const newSlides = editor.value.filter((_, idx) => idx !== i);
                    setEditor({ ...editor, value: newSlides });
                  }}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-fit" onClick={() => {
                setEditor({ ...editor, value: [...editor.value, { title: "", url: "" }] });
              }}>
                <Plus className="mr-2 size-3.5" />
                Add link
              </Button>
            </div>
          ) : (
            <FormField label={copy?.label ?? ""} htmlFor="editorValue">
              {editor?.kind === "summary" ? (
                <Textarea
                  id="editorValue"
                  rows={6}
                  value={editor.value}
                  onChange={(e) => setEditor({ ...editor, value: e.target.value })}
                  placeholder={copy?.placeholder}
                />
              ) : (
                <Input
                  id="editorValue"
                  type="text"
                  value={editor?.value ?? ""}
                  onChange={(e) => setEditor(editor && { ...editor, value: e.target.value })}
                  placeholder={copy?.placeholder}
                />
              )}
            </FormField>
          )}

          {editor && hasDate(editor) && (
            <FormField label="Scheduled date & time (optional)" htmlFor="editorDate">
              <Input
                id="editorDate"
                type="datetime-local"
                value={editor.date}
                onChange={(e) => setEditor({ ...editor, date: e.target.value })}
              />
            </FormField>
          )}

          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleSave} disabled={mutate.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MaterialButton({
  icon: Icon,
  label,
  url,
  onEdit,
}: {
  icon: typeof Presentation;
  label: string;
  url: string | null;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Icon className="size-3.5" />
        {url ? `Edit ${label}` : `Add ${label}`}
      </Button>
      {url && (
        <Button
          variant="ghost"
          size="icon-sm"
          render={<a href={url} target="_blank" rel="noopener noreferrer" />}
          aria-label={`Open ${label}`}
        >
          <ExternalLink className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

function SlidesButton({
  slides,
  onEdit,
}: {
  slides: { title: string; url: string }[];
  onEdit: () => void;
}) {
  const count = slides.length;
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Presentation className="size-3.5" />
        {count > 0 ? `Edit slides (${count})` : `Add slides`}
      </Button>
    </div>
  );
}
