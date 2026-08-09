"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronDown, ExternalLink, Pencil, Plus, Presentation, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { FormField } from "@/components/common/form-field";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { studyPlanService } from "@/services/learning.service";
import { lessonBrowserService } from "@/services/lesson-browser.service";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

type Editor =
  | { kind: "slides"; lessonId: string; value: string }
  | { kind: "module"; moduleId: string; value: string; date: string }
  | { kind: "lesson"; lessonId: string; value: string }
  | { kind: "new-module"; value: string; date: string }
  | { kind: "new-lesson"; moduleId: string; value: string };

// Only module editors carry a schedule date.
const hasDate = (editor: Editor): editor is Extract<Editor, { date: string }> =>
  editor.kind === "module" || editor.kind === "new-module";

const EDITOR_COPY: Record<Editor["kind"], { title: string; label: string; placeholder: string }> = {
  slides: { title: "Slides link", label: "Google Drive link", placeholder: "https://drive.google.com/..." },
  module: { title: "Rename module", label: "Module title", placeholder: "e.g. Foundations" },
  lesson: { title: "Rename class", label: "Class title", placeholder: "e.g. What is an agent?" },
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
    const value = editor.value.trim();
    if (editor.kind !== "slides" && !value) {
      toast.error("Please enter a title");
      return;
    }

    switch (editor.kind) {
      case "slides":
        return run(() => studyPlanService.setLessonSlides(editor.lessonId, editor.value));
      case "module":
        return run(() => studyPlanService.updateModule(editor.moduleId, value, editor.date));
      case "lesson":
        return run(() => studyPlanService.renameLesson(editor.lessonId, value));
      case "new-module":
        return run(() => studyPlanService.createModule(cohortId, value, editor.date));
      case "new-lesson":
        return run(() => studyPlanService.createLesson(editor.moduleId, value));
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
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const allLessons = modules?.flatMap((m) => m.lessons) ?? [];
  const taughtCount = allLessons.filter((l) => l.taught).length;
  const taughtPercent = allLessons.length === 0 ? 0 : Math.round((taughtCount / allLessons.length) * 100);
  const copy = editor ? EDITOR_COPY[editor.kind] : null;

  return (
    <>
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <p className="font-heading text-sm font-medium text-foreground">
              {taughtCount} of {allLessons.length} classes completed
            </p>
            <span className="text-xs text-muted-foreground">{taughtPercent}%</span>
          </div>
          <Progress value={taughtPercent} />
          <p className="text-xs text-muted-foreground">
            Tick a class once you&apos;ve taught it — students see the same list.
          </p>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={() => setEditor({ kind: "new-module", value: "", date: "" })}
        className="mb-4 h-auto w-full border-dashed py-4"
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

      <div className="flex flex-col gap-3">
        {modules?.map((module, index) => {
          const isExpanded = expanded === module.id;
          const moduleTaught = module.lessons.filter((l) => l.taught).length;

          return (
            <Card key={module.id}>
              <CardContent className="flex flex-col gap-0 p-0">
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : module.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">Module {index + 1}</span>
                    <span className="truncate font-heading text-sm font-medium text-foreground">{module.title}</span>
                    {module.scheduledFor && (
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatDate(module.scheduledFor)}
                      </span>
                    )}
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {moduleTaught}/{module.lessons.length} taught
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setEditor({
                          kind: "module",
                          moduleId: module.id,
                          value: module.title,
                          // <input type="date"> wants YYYY-MM-DD, not a full ISO timestamp.
                          date: module.scheduledFor ? module.scheduledFor.slice(0, 10) : "",
                        })
                      }
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
                    <button onClick={() => setExpanded(isExpanded ? null : module.id)} aria-label="Toggle classes">
                      <ChevronDown
                        className={cn("size-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="flex flex-col gap-1 border-t border-border/60 px-4 py-3">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-2.5 rounded-md py-1.5 hover:bg-muted/60">
                        <Checkbox
                          checked={lesson.taught}
                          onCheckedChange={(checked) =>
                            run(() => studyPlanService.setLessonTaught(lesson.id, checked === true))
                          }
                          aria-label={`Mark ${lesson.title} taught`}
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-sm",
                            lesson.taught ? "text-muted-foreground" : "text-foreground",
                          )}
                        >
                          {lesson.title}
                        </span>

                        {lesson.slidesUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            render={<a href={lesson.slidesUrl} target="_blank" rel="noopener noreferrer" />}
                          >
                            <ExternalLink className="size-3.5" />
                            Open
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditor({ kind: "slides", lessonId: lesson.id, value: lesson.slidesUrl ?? "" })}
                        >
                          <Presentation className="size-3.5" />
                          {lesson.slidesUrl ? "Edit slides" : "Add slides"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditor({ kind: "lesson", lessonId: lesson.id, value: lesson.title })}
                          aria-label={`Rename ${lesson.title}`}
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
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditor({ kind: "new-lesson", moduleId: module.id, value: "" })}
                      className="mt-1 w-fit"
                    >
                      <Plus className="size-3.5" />
                      Add a class
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy?.title}</DialogTitle>
          </DialogHeader>
          <FormField label={copy?.label ?? ""} htmlFor="editorValue">
            <Input
              id="editorValue"
              type={editor?.kind === "slides" ? "url" : "text"}
              value={editor?.value ?? ""}
              onChange={(e) => setEditor(editor && { ...editor, value: e.target.value })}
              placeholder={copy?.placeholder}
            />
          </FormField>

          {editor && hasDate(editor) && (
            <FormField label="Scheduled date (optional)" htmlFor="editorDate">
              <Input
                id="editorDate"
                type="date"
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
