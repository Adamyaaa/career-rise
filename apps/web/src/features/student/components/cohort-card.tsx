import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { MyCohortSummary } from "@/services/learning.service";

export function CohortCard({ cohort, hrefBase }: { cohort: MyCohortSummary; hrefBase: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary/10 p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">{cohort.name}</p>
          <h2 className="font-heading text-2xl font-medium text-foreground">{cohort.course.title}</h2>
          <p className="text-sm text-muted-foreground">
            {cohort.progress ? `${cohort.progress.totalLessons} lessons · ` : ""}
            {/* First scheduled module when there is one, so this matches the cohort header. */}
            started {formatDate(cohort.firstClassDate ?? cohort.startDate)}
          </p>

          {cohort.progress && (
            <div className="mt-2 w-full max-w-xs">
              <Progress value={cohort.progress.percent} />
              <p className="mt-2 text-xs font-medium text-muted-foreground">{cohort.progress.percent}% complete</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <Button size="xl" render={<Link href={`${hrefBase}/${cohort.id}`} />}>
            Open cohort <ArrowRight className="size-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
