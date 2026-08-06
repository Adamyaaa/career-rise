"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { evidenceService } from "@/services/evidence.service";
import { mockMentors, currentMockMentorId } from "@/lib/mock-seed";
import type { Evidence, ReviewCriterion } from "@/types/evidence";

const scoreSchema = z.object({
  criterionId: z.string(),
  criterionName: z.string(),
  maxScore: z.number(),
  score: z.coerce.number().min(0, "Min 0").max(10, "Max 10"),
  comment: z.string().optional(),
});

const schema = z.object({
  overallComment: z.string().min(1, "Add an overall comment"),
  scores: z.array(scoreSchema),
});

type Values = z.infer<typeof schema>;

// All active criteria must be scored before a review can be submitted — the same rule
// enforced server-side once the Reviews module is built (see Phase 4 plan).
export function ReviewForm({ evidence, criteria }: { evidence: Evidence; criteria: ReviewCriterion[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mentor = mockMentors.find((m) => m.userId === currentMockMentorId)!;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      overallComment: "",
      scores: criteria.map((c) => ({ criterionId: c.id, criterionName: c.name, maxScore: 10, score: 7, comment: "" })),
    },
  });
  const { fields } = useFieldArray({ control, name: "scores" });

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      evidenceService.submitReview({
        evidenceId: evidence.id,
        mentorId: mentor.userId,
        mentorName: mentor.name,
        overallComment: values.overallComment,
        scores: values.scores,
      }),
    onSuccess: () => {
      toast.success("Review submitted");
      queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      router.push("/mentor/reviews");
    },
    onError: () => toast.error("Couldn't submit review — try again."),
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit((v: any) => mutation.mutate(v))} noValidate>
      <div className="flex flex-col gap-4">
        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-lg border border-border/60 p-3">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">{field.criterionName}</p>
              <FormField label="Comment (optional)" htmlFor={`scores.${i}.comment`} className="gap-1">
                <Textarea rows={2} placeholder="Optional note for this criterion" {...register(`scores.${i}.comment`)} />
              </FormField>
            </div>
            <FormField label="Score /10" htmlFor={`scores.${i}.score`} error={errors.scores?.[i]?.score?.message}>
              <Input id={`scores.${i}.score`} type="number" min={0} max={10} className="w-20" {...register(`scores.${i}.score`)} />
            </FormField>
          </div>
        ))}
      </div>

      <FormField label="Overall comment" htmlFor="overallComment" error={errors.overallComment?.message}>
        <Textarea id="overallComment" rows={4} placeholder="Summarize your feedback…" {...register("overallComment")} />
      </FormField>

      <Button type="submit" className="w-fit" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Submit review
      </Button>
    </form>
  );
}
