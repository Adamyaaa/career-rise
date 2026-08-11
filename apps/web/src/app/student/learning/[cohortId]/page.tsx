"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, CalendarDays, CheckCircle2, Circle, FileText, Presentation, GraduationCap, BookOpen, MessageCircle, MoreVertical } from "lucide-react";
import { CohortHeader } from "@/features/cohort/components/cohort-header";
import { CohortAnnouncements } from "@/features/cohort/components/cohort-announcements";
import { LessonFeedbackComposer } from "@/features/cohort/components/lesson-feedback-composer";
import { CircularProgress } from "@/components/common/circular-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { learningService } from "@/services/learning.service";
import { toast } from "sonner";

export default function CohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = use(params);
  const [expanded, setExpanded] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const toggleLesson = useMutation({
    mutationFn: ({ lessonId, completed }: { lessonId: string; completed: boolean }) =>
      completed ? learningService.markLessonComplete(lessonId) : learningService.markLessonIncomplete(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-modules", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohort-overview", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
    },
    onError: () => toast.error("Couldn't update — try again"),
  });

  const { data: modules, isLoading } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => learningService.getCohortModules(cohortId),
  });

  const totalLessons = modules?.reduce((sum, m) => sum + m.totalLessons, 0) ?? 0;
  const completedLessons = modules?.reduce((sum, m) => sum + m.completedLessons, 0) ?? 0;
  const overallPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <>
      <CohortHeader cohortId={cohortId} />

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && modules && (
        <Tabs defaultValue="study-plan">
          <TabsList variant="line">
            <TabsTrigger value="study-plan">Study plan</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="study-plan" className="mt-4 flex flex-col gap-3">
            {modules.map((module) => {
              const isExpanded = expanded === module.id;
              return (
                <Card key={module.id}>
                  <CardContent
                    role="button"
                    onClick={() => setExpanded(isExpanded ? null : module.id)}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <CircularProgress percent={module.percent} size={40} strokeWidth={4} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate font-heading text-sm font-medium text-foreground">{module.title}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {module.scheduledFor && (
                          <>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="size-3.5 shrink-0" />
                              {formatDate(module.scheduledFor)}
                            </span>
                            <span aria-hidden>·</span>
                          </>
                        )}
                        <span>
                          {module.completedLessons}/{module.totalLessons} lessons complete
                        </span>
                      </p>
                    </div>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                  </CardContent>

                  {isExpanded && (
                    <div className="flex flex-col gap-1 border-t border-border/60 px-4 py-3">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-2 rounded-md hover:bg-muted/60">
                          <button
                            onClick={() => toggleLesson.mutate({ lessonId: lesson.id, completed: !lesson.completed })}
                            disabled={toggleLesson.isPending}
                            className="flex flex-1 items-center gap-2.5 py-1.5 text-left text-sm disabled:opacity-60"
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="size-4 shrink-0 text-primary" />
                            ) : (
                              <Circle className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className={cn("text-foreground", lesson.completed && "text-muted-foreground")}>{lesson.title}</span>
                            {lesson.taught && (
                              <Badge variant="secondary" className="shrink-0 text-[10px]">
                                Covered in class
                              </Badge>
                            )}
                          </button>
                          {lesson.slidesUrl ? (
                            <a
                              href={lesson.slidesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                            >
                              <Presentation className="size-3.5" />
                              Slides
                            </a>
                          ) : (
                            <span
                              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground/50"
                              title="No slides link shared yet"
                            >
                              <Presentation className="size-3.5" />
                              Slides
                            </span>
                          )}

                          {lesson.assignmentsUrl ? (
                            <a
                              href={lesson.assignmentsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                            >
                              <FileText className="size-3.5" />
                              Assignments
                            </a>
                          ) : (
                            <span
                              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground/50"
                              title="No assignments link shared yet"
                            >
                              <FileText className="size-3.5" />
                              Assignments
                            </span>
                          )}

                          <LessonFeedbackComposer lessonId={lesson.id} lessonTitle={lesson.title} />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="announcements" className="mt-4">
            <CohortAnnouncements cohortId={cohortId} canManage={false} />
          </TabsContent>

          <TabsContent value="progress" className="mt-4 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <CircularProgress percent={overallPercent} size={72} strokeWidth={6} />
              <div>
                <p className="font-heading text-lg font-medium text-foreground">{overallPercent}% complete</p>
                <p className="text-sm text-muted-foreground">
                  {completedLessons} of {totalLessons} lessons across this cohort
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {modules.map((module) => (
                <div key={module.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{module.title}</span>
                    <span className="text-muted-foreground">{module.percent}%</span>
                  </div>
                  <Progress value={module.percent} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
