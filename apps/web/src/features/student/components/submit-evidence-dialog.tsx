"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { evidenceService } from "@/services/evidence.service";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  externalUrl: z.string().min(1, "Paste a link").url("Enter a valid link"),
});
type Values = z.infer<typeof schema>;

export function SubmitEvidenceDialog({
  open,
  onOpenChange,
  cohortId,
  lessonId,
  lessonTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohortId: string;
  lessonId: string;
  lessonTitle: string;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: Values) => evidenceService.submit({ lessonId, externalUrl: values.externalUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-modules", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["my-evidence", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["my-cohorts"] });
      toast.success("Submitted");
      reset();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't submit — try again"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit proof</DialogTitle>
          <DialogDescription>
            Share a Drive link for <span className="text-foreground">{lessonTitle}</span> as evidence of your work.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <FormField label="Drive link" htmlFor="externalUrl" error={errors.externalUrl?.message}>
            <Input
              id="externalUrl"
              type="url"
              placeholder="https://drive.google.com/..."
              {...register("externalUrl")}
            />
          </FormField>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) && <Loader2 className="size-4 animate-spin" />}
              <LinkIcon className="size-4" />
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
