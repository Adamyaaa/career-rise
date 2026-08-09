"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { learningService } from "@/services/learning.service";
import { sharedFilesService } from "@/services/shared-files.service";
import { toast } from "sonner";
import { formatBytes } from "@/lib/format";

export function ShareFileInCohortForm({ cohortId, onDone }: { cohortId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: modules = [] } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => learningService.getCohortModules(cohortId),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => sharedFilesService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-files", cohortId] });
      toast.success("File shared with this cohort");
      onDone();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to upload file"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!title) {
      const cleanName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setTitle(cleanName.replace(/[-_]/g, " "));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    if (lessonId) formData.append("lessonId", lessonId);
    else formData.append("cohortId", cohortId);

    uploadMutation.mutate(formData);
  };

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Share a file with this cohort</CardTitle>
        <CardDescription>
          Attach it to a specific lesson so it shows up as course material there, or leave it cohort-wide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="File" htmlFor="fileInput">
            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-6 hover:bg-muted/30">
              <Upload className="mb-2 size-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {selectedFile ? selectedFile.name : "Choose a file to upload"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {selectedFile ? formatBytes(selectedFile.size) : "PDF, ZIP, images, code files, etc."}
              </span>
              <input id="fileInput" type="file" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
            </div>
          </FormField>

          <FormField label="Title" htmlFor="title">
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 1 Slides" required />
          </FormField>

          <FormField label="Description (optional)" htmlFor="description">
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
          </FormField>

          <FormField label="Lesson (optional)" htmlFor="lesson">
            <select
              id="lesson"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending && <Upload className="mr-1.5 size-4 animate-spin" />}
              Upload & Share
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
