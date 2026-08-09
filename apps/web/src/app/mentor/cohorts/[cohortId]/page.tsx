"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2, Calendar, User, FileArchive, FileCode, FileImage, Plus, Library } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShareFileInCohortForm } from "@/features/mentor/components/share-file-in-cohort-form";
import { StudyPlanManager } from "@/features/mentor/components/study-plan-manager";
import { CohortRoster } from "@/features/mentor/components/cohort-roster";
import { CohortFeedback } from "@/features/mentor/components/cohort-feedback";
import { CohortHeader } from "@/features/cohort/components/cohort-header";
import { sharedFilesService } from "@/services/shared-files.service";
import { toast } from "sonner";
import { formatBytes, fullName } from "@/lib/format";

const getFileIcon = (mime: string) => {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("image")) return FileImage;
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return FileArchive;
  if (mime.includes("javascript") || mime.includes("typescript") || mime.includes("json") || mime.includes("html")) return FileCode;
  return FileText;
};

export default function MentorCohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = use(params);
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);

  const { data: files, isLoading } = useQuery({
    queryKey: ["shared-files", cohortId],
    queryFn: () => sharedFilesService.list({ cohortId }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sharedFilesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-files", cohortId] });
      toast.success("File deleted");
    },
    onError: () => toast.error("Failed to delete file"),
  });

  const handleDelete = (id: string) => {
    if (confirm("Delete this resource? This cannot be undone.")) deleteMutation.mutate(id);
  };

  return (
    <>
      <CohortHeader cohortId={cohortId} />

      <Tabs defaultValue="study-plan">
        <TabsList variant="line">
          <TabsTrigger value="study-plan">Study plan</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="files">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="study-plan" className="mt-4">
          <StudyPlanManager cohortId={cohortId} />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <CohortRoster cohortId={cohortId} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          <CohortFeedback cohortId={cohortId} />
        </TabsContent>

        <TabsContent value="files" className="mt-4 flex flex-col gap-4">
          {!showUpload && (
            <div className="flex justify-end">
              <Button onClick={() => setShowUpload(true)} className="w-fit">
                <Plus className="mr-1.5 size-4" />
                Share a File
              </Button>
            </div>
          )}

          {showUpload ? (
            <ShareFileInCohortForm cohortId={cohortId} onDone={() => setShowUpload(false)} />
          ) : (
            <>
              {isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>
              )}

              {!isLoading && (!files || files.length === 0) && (
                <EmptyState icon={Library} title="Nothing shared yet" description="Share your first file with this cohort." />
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
                            <span>Uploaded by: {fullName(file.uploadedBy)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3" />
                            <span>Shared: {new Date(file.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px]">
                              {formatBytes(file.fileSize)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(file.id)}
                              className="size-7 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
