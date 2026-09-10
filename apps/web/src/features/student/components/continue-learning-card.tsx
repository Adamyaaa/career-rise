"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PartyPopper, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/common/circular-progress";
import { learningService } from "@/services/learning.service";
import type { MyCohortSummary } from "@/services/learning.service";

export function ContinueLearningCard({ cohort }: { cohort: MyCohortSummary }) {
  const href = `/student/learning/${cohort.id}`;

  const mentorsList = cohort.mentors?.length
    ? cohort.mentors.map((m) => m.name).join(", ")
    : "TBA";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            Your Cohort
          </p>
          <h2 className="font-heading text-2xl font-medium text-foreground">{cohort.course.title}</h2>

          <p className="text-sm text-muted-foreground">
            {cohort.moduleCount || 0} modules · Mentored by <span className="font-medium text-foreground">{mentorsList}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <Button size="xl" render={<Link href={href} />}>
            Go to cohort <ArrowRight className="size-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
