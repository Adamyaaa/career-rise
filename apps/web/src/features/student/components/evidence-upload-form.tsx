"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/common/form-field";
import { FileUpload } from "@/components/common/file-upload";
import { evidenceService } from "@/services/evidence.service";
import { currentMockStudentId } from "@/lib/mock-seed";
import type { Assignment, EvidenceType } from "@/types/evidence";

const linkBasedTypes: EvidenceType[] = ["github_repo", "figma", "drive_link", "video"];

const schema = z
  .object({
    evidenceType: z.enum(["github_repo", "pdf", "figma", "drive_link", "video"]),
    externalUrl: z.string().optional(),
  })
  .refine((data) => !linkBasedTypes.includes(data.evidenceType as EvidenceType) || !!data.externalUrl, {
    message: "A link is required for this evidence type",
    path: ["externalUrl"],
  });

type Values = z.infer<typeof schema>;

export function EvidenceUploadForm({ assignment }: { assignment: Assignment }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { evidenceType: assignment.expectedEvidenceType },
  });

  const evidenceType = watch("evidenceType");
  const isLinkBased = linkBasedTypes.includes(evidenceType as EvidenceType);

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      evidenceService.submitEvidence({
        studentId: currentMockStudentId,
        lessonId: assignment.lessonId,
        cohortId: assignment.cohortId,
        evidenceType: values.evidenceType as EvidenceType,
        externalUrl: values.externalUrl,
        fileName: file?.name,
      }),
    onSuccess: () => {
      toast.success("Evidence submitted");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", assignment.id] });
    },
    onError: () => toast.error("Couldn't submit evidence — try again."),
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
      <FormField label="Evidence type" htmlFor="evidenceType">
        <Controller
          control={control}
          name="evidenceType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="evidenceType" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github_repo">GitHub repo</SelectItem>
                <SelectItem value="drive_link">Drive link</SelectItem>
                <SelectItem value="figma">Figma</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {isLinkBased ? (
        <FormField label="Link" htmlFor="externalUrl" error={errors.externalUrl?.message}>
          <Input id="externalUrl" placeholder="https://…" {...register("externalUrl")} />
        </FormField>
      ) : (
        <FormField label="File" htmlFor="file">
          <FileUpload onFileSelect={setFile} accept="application/pdf" />
        </FormField>
      )}

      <Button type="submit" className="w-fit" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Submit evidence
      </Button>
    </form>
  );
}
