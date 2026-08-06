"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, Trash2, Calendar, User, FileArchive, FileCode, FileImage, Plus, Library, BookOpen } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { sharedFilesService, SharedFile } from "@/services/shared-files.service";
import { lessonBrowserService } from "@/services/lesson-browser.service";
import { toast } from "sonner";
import { formatBytes } from "@/lib/format";

const getFileIcon = (mime: string) => {
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("image")) return FileImage;
  if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return FileArchive;
  if (mime.includes("javascript") || mime.includes("typescript") || mime.includes("json") || mime.includes("html")) return FileCode;
  return FileText;
};

export default function MentorResourcesPage() {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: cohorts = [] } = useQuery({
    queryKey: ["cohorts"],
    queryFn: () => lessonBrowserService.listCohorts(),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => lessonBrowserService.listModules(cohortId),
    enabled: !!cohortId,
  });

  const { data: files, isLoading } = useQuery({
    queryKey: ["shared-files"],
    queryFn: () => sharedFilesService.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => sharedFilesService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-files"] });
      toast.success("File uploaded successfully!");
      setTitle("");
      setDescription("");
      setCohortId("");
      setLessonId("");
      setSelectedFile(null);
      setShowUpload(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload file");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sharedFilesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-files"] });
      toast.success("File deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete file");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Auto-fill title with humanized file name
        const cleanName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setTitle(cleanName.replace(/[-_]/g, " "));
      }
    }
  };

  const handleCohortChange = (value: string) => {
    setCohortId(value);
    setLessonId(""); // lesson choice no longer valid once the cohort changes
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!title.trim()) {
      toast.error("Please provide a title");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (lessonId) {
      // cohortId is derived server-side from the lesson, no need to send it too
      formData.append("lessonId", lessonId);
    } else if (cohortId) {
      formData.append("cohortId", cohortId);
    }

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this resource? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeading title="Resource Library" description="Manage and share educational material, guides, and assignments." />
        <Button onClick={() => setShowUpload(!showUpload)} className="w-fit self-end">
          <Plus className="size-4 mr-1.5" />
          {showUpload ? "View Library" : "Share a File"}
        </Button>
      </div>

      {showUpload ? (
        <Card className="max-w-xl mx-auto mt-6">
          <CardHeader>
            <CardTitle>Share new resource</CardTitle>
            <CardDescription>
              Upload a file to share with students. Attach it to a specific lesson so it shows up as course material
              there, or leave it scoped to a cohort (or fully global) for a general resource.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <FormField label="File" htmlFor="fileInput">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-muted/20 cursor-pointer hover:bg-muted/30 relative">
                  <Upload className="size-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">
                    {selectedFile ? selectedFile.name : "Choose a file to upload"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {selectedFile ? `${formatBytes(selectedFile.size)}` : "PDF, ZIP, images, code files, etc."}
                  </span>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </FormField>

              <FormField label="Resource Title" htmlFor="title">
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 1 Slides - Intro to Docker"
                  required
                />
              </FormField>

              <FormField label="Description (Optional)" htmlFor="description">
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a short description of this file."
                />
              </FormField>

              <FormField label="Cohort Scope" htmlFor="cohort">
                <select
                  id="cohort"
                  value={cohortId}
                  onChange={(e) => handleCohortChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Cohorts (Global)</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.course.title}
                    </option>
                  ))}
                </select>
              </FormField>

              {cohortId && (
                <FormField label="Lesson (Optional)" htmlFor="lesson">
                  <select
                    id="lesson"
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Cohort-wide (not tied to a lesson)</option>
                    {modules.map((m) => (
                      <optgroup key={m.id} label={m.title}>
                        {m.lessons.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </FormField>
              )}

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending && <Upload className="size-4 animate-spin mr-1.5" />}
                  Upload & Share
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6">
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          )}

          {!isLoading && (!files || files.length === 0) && (
            <EmptyState icon={Library} title="No shared resources yet" description="Start uploading resources to make them available to your students." />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files?.map((file) => {
              const Icon = getFileIcon(file.mimeType);
              return (
                <Card key={file.id} className="h-full transition-all hover:shadow-md">
                  <CardContent className="flex flex-col h-full justify-between p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-sm font-semibold text-foreground truncate" title={file.title}>
                            {file.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                          {file.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3" />
                        <span>Uploaded by: {file.uploadedBy.email.split("@")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3" />
                        <span>Shared: {new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {formatBytes(file.fileSize)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {file.cohortId ? cohorts.find((c) => c.id === file.cohortId)?.name || "Cohort" : "Global"}
                        </Badge>
                        {file.lessonId && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <BookOpen className="size-2.5" />
                            Lesson material
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file.id)}
                          className="size-7 ml-auto text-destructive hover:bg-destructive/10"
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
        </div>
      )}
    </>
  );
}
