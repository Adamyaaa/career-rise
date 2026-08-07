"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Lock, FileText, Download, Library, Calendar, User, FileArchive, FileCode, FileImage, CheckCircle2, Circle, ExternalLink, LinkIcon } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { CircularProgress } from "@/components/common/circular-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubmitEvidenceDialog } from "@/features/student/components/submit-evidence-dialog";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";
import { learningService } from "@/services/learning.service";
import { sharedFilesService } from "@/services/shared-files.service";
import { evidenceService } from "@/services/evidence.service";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const getFileIcon = (mime: string) => {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("image")) return FileImage;
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return FileArchive;
  if (mime.includes("javascript") || mime.includes("typescript") || mime.includes("json") || mime.includes("html")) return FileCode;
  return FileText;
};

export default function CohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = use(params);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submittingLesson, setSubmittingLesson] = useState<{ id: string; title: string } | null>(null);
  const token = useAuthStore((s) => s.accessToken);

  const handleDownload = async (fileId: string, fileName: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";
    toast.promise(
      (async () => {
        const res = await fetch(`${API_BASE_URL}/shared-files/${fileId}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to download file");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })(),
      { loading: "Preparing download...", success: "Download started!", error: "Failed to download file." },
    );
  };

  const { data: modules, isLoading } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => learningService.getCohortModules(cohortId),
  });

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ["shared-files", cohortId],
    queryFn: () => sharedFilesService.list({ cohortId }),
  });

  const { data: evidence } = useQuery({
    queryKey: ["my-evidence", cohortId],
    queryFn: () => evidenceService.listMine(cohortId),
  });
  // Sorted newest-first by the API — first match per lesson is the latest submission.
  const evidenceByLesson = new Map(evidence?.map((e) => [e.lessonId, e]).reverse());

  const totalLessons = modules?.reduce((sum, m) => sum + m.totalLessons, 0) ?? 0;
  const completedLessons = modules?.reduce((sum, m) => sum + m.completedLessons, 0) ?? 0;
  const overallPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <>
      <PageHeading title="Study plan" description="Modules, resources, and your progress for this cohort." />

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
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="study-plan" className="mt-4 flex flex-col gap-3">
            {modules.map((module) => {
              const isExpanded = expanded === module.id;
              return (
                <Card key={module.id} className={cn(module.locked && "opacity-60")}>
                  <CardContent
                    role="button"
                    onClick={() => !module.locked && setExpanded(isExpanded ? null : module.id)}
                    className={cn("flex items-center gap-3", !module.locked && "cursor-pointer")}
                  >
                    <CircularProgress percent={module.percent} size={40} strokeWidth={4} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-heading text-sm font-medium text-foreground">{module.title}</p>
                        {module.locked && <Lock className="size-3.5 shrink-0 text-muted-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {module.completedLessons}/{module.totalLessons} lessons complete
                      </p>
                    </div>
                    {!module.locked && (
                      <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    )}
                  </CardContent>

                  {isExpanded && !module.locked && (
                    <div className="flex flex-col gap-2 border-t border-border/60 px-4 py-3">
                      {module.lessons.map((lesson) => {
                        const submission = evidenceByLesson.get(lesson.id);
                        return (
                          <div key={lesson.id} className="flex items-center gap-2.5 text-sm">
                            {lesson.completed ? (
                              <CheckCircle2 className="size-4 shrink-0 text-primary" />
                            ) : (
                              <Circle className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className={cn("flex-1 text-foreground", lesson.completed && "text-muted-foreground")}>
                              {lesson.title}
                            </span>
                            {submission ? (
                              <a
                                href={submission.externalUrl ?? undefined}
                                target="_blank"
                                rel="noreferrer"
                                className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                              >
                                View submission <ExternalLink className="size-3" />
                              </a>
                            ) : (
                              <button
                                onClick={() => setSubmittingLesson({ id: lesson.id, title: lesson.title })}
                                className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                              >
                                <LinkIcon className="size-3" />
                                Submit proof
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            {filesLoading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            )}

            {!filesLoading && (!files || files.length === 0) && (
              <EmptyState icon={Library} title="No shared resources yet" description="Nothing has been shared for this cohort yet." />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files?.map((file) => {
                const Icon = getFileIcon(file.mimeType);
                return (
                  <Card key={file.id}>
                    <CardContent className="flex h-full flex-col justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="truncate text-sm font-semibold text-foreground" title={file.title}>
                            {file.title}
                          </p>
                          <p className="line-clamp-2 min-h-[2rem] text-xs text-muted-foreground">
                            {file.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3" />
                          <span>Uploaded by: {file.uploadedBy.email.split("@")[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3" />
                          <span>Shared: {new Date(file.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="secondary" className="text-[10px]">
                            {formatBytes(file.fileSize)}
                          </Badge>
                          <button
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                          >
                            <Download className="size-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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

      {submittingLesson && (
        <SubmitEvidenceDialog
          open={!!submittingLesson}
          onOpenChange={(open) => !open && setSubmittingLesson(null)}
          cohortId={cohortId}
          lessonId={submittingLesson.id}
          lessonTitle={submittingLesson.title}
        />
      )}
    </>
  );
}
