"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Library, Calendar, User, FileArchive, FileCode, FileImage } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { sharedFilesService } from "@/services/shared-files.service";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { formatBytes, fullName } from "@/lib/format";

const getFileIcon = (mime: string) => {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("image")) return FileImage;
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return FileArchive;
  if (mime.includes("javascript") || mime.includes("typescript") || mime.includes("json") || mime.includes("html")) return FileCode;
  return FileText;
};

export default function ResourcesPage() {
  const token = useAuthStore((s) => s.accessToken);

  const { data: files, isLoading } = useQuery({
    queryKey: ["shared-files"],
    queryFn: () => sharedFilesService.list(),
  });

  const handleDownload = async (fileId: string, fileName: string) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";
    toast.promise(
      (async () => {
        const res = await fetch(`${API_BASE_URL}/shared-files/${fileId}/download`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to download file");
        }
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
      {
        loading: "Preparing download...",
        success: "Download started!",
        error: "Failed to download file.",
      }
    );
  };

  return (
    <>
      <PageHeading title="Shared Resources" description="Files, slides, and course readings shared by your mentors and admins." />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      )}

      {!isLoading && (!files || files.length === 0) && (
        <EmptyState icon={Library} title="No shared resources yet" description="Your mentors haven't uploaded any documents or slides yet." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files?.map((file) => {
          const Icon = getFileIcon(file.mimeType);
          return (
            <Card key={file.id} className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardContent className="flex flex-col h-full justify-between p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate" title={file.title}>
                      {file.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {file.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="size-3" />
                    <span>Uploaded by: {fullName(file.uploadedBy)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3" />
                    <span>Shared: {new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
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
    </>
  );
}
