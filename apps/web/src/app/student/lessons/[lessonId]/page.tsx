"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  FileText,
  Sparkles,
  Video,
  Presentation,
  Link as LinkIcon,
  Download,
  FileArchive,
  FileCode,
  FileImage,
  FolderOpen,
} from "lucide-react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { AiActions } from "@/components/common/ai-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { coursesService } from "@/services/courses.service";
import { evidenceService } from "@/services/evidence.service";
import { sharedFilesService } from "@/services/shared-files.service";
import { mockModules } from "@/lib/mock-seed";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { formatBytes } from "@/lib/format";

const materialIcon = (mime: string) => {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("image")) return FileImage;
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return FileArchive;
  if (mime.includes("javascript") || mime.includes("typescript") || mime.includes("json") || mime.includes("html")) return FileCode;
  return FileText;
};

const resourceIcon = { pdf: FileText, video: Video, slides: Presentation, link: LinkIcon };

export default function LessonViewPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const token = useAuthStore((s) => s.accessToken);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => coursesService.getLesson(lessonId),
  });
  const { data: resources = [] } = useQuery({
    queryKey: ["resources", lessonId],
    queryFn: () => coursesService.listResources(lessonId),
  });
  const { data: material = [], isLoading: materialLoading } = useQuery({
    queryKey: ["shared-files", "lesson", lessonId],
    queryFn: () => sharedFilesService.list({ lessonId }),
  });
  const { data: session } = useQuery({
    queryKey: ["session", lessonId],
    queryFn: () => coursesService.getSessionForLesson(lessonId),
  });
  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments-for-lesson", lessonId],
    queryFn: () => evidenceService.listAssignments(),
  });

  const assignment = assignments.find((a) => a.lessonId === lessonId);
  const cohortModule = lesson ? mockModules.find((m) => m.id === lesson.moduleId) : undefined;

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!lesson) return <p className="text-sm text-muted-foreground">Lesson not found.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/student/courses" },
          { label: "Cohort 3", href: "/student/courses/cohort-1" },
          { label: lesson.title },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {cohortModule && <Badge variant="secondary">{cohortModule.title}</Badge>}
        {session && <Badge variant="outline">{session.deliveryType.replace("_", " ")}</Badge>}
        <Badge variant="outline" className="gap-1">
          <Clock className="size-3" />
          {lesson.durationMins} min
        </Badge>
      </div>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{lesson.title}</h1>

      <Card className="mt-6">
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-foreground">{lesson.content}</p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            AI study tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AiActions />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="size-4 text-primary" />
            Course material
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {materialLoading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          )}
          {!materialLoading && material.length === 0 && (
            <EmptyState
              icon={FolderOpen}
              title="No material for this lesson yet"
              description="Your mentor hasn't attached any files to this lesson."
            />
          )}
          {material.map((file) => {
            const Icon = materialIcon(file.mimeType);
            return (
              <button
                key={file.id}
                onClick={() => handleDownload(file.id, file.fileName)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{file.title}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(file.fileSize)}</span>
                <Download className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Resources</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {resources.map((resource) => {
            const Icon = resourceIcon[resource.type];
            return (
              <a
                key={resource.id}
                href={resource.url}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                {resource.title}
              </a>
            );
          })}
        </CardContent>
      </Card>

      {assignment && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">{assignment.title}</p>
            <p className="text-xs text-muted-foreground">Submit evidence for this lesson</p>
          </div>
          <Button size="sm" render={<Link href={`/student/assignments/${assignment.id}`} />}>
            Go to assignment <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
