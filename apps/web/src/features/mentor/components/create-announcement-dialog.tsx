"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/common/form-field";
import { announcementsService } from "@/services/notifications.service";
import { mockMentors, currentMockMentorId } from "@/lib/mock-seed";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required"),
});
type Values = z.infer<typeof schema>;

export function CreateAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const mentor = mockMentors.find((m) => m.userId === currentMockMentorId)!;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      announcementsService.create({ cohortId: "cohort-1", authorName: mentor.name, ...values }),
    onSuccess: () => {
      toast.success("Announcement posted");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-3.5" />
        New announcement
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New announcement</DialogTitle>
          <DialogDescription>Posted to Agentic AI · Cohort 3.</DialogDescription>
        </DialogHeader>
        <form id="announcement-form" className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <FormField label="Title" htmlFor="title" error={errors.title?.message}>
            <Input id="title" {...register("title")} />
          </FormField>
          <FormField label="Message" htmlFor="body" error={errors.body?.message}>
            <Textarea id="body" rows={4} {...register("body")} />
          </FormField>
        </form>
        <DialogFooter>
          <Button type="submit" form="announcement-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Post announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
