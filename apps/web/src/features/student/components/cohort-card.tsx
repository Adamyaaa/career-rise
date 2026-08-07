import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/format";
import type { MyCohortSummary } from "@/services/learning.service";

export function CohortCard({ cohort }: { cohort: MyCohortSummary }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">{cohort.name}</p>
          <p className="font-heading text-lg font-medium text-foreground">{cohort.course.title}</p>
          <p className="text-xs text-muted-foreground">
            {cohort.progress.totalLessons} lessons · started {formatDate(cohort.startDate)}
          </p>

          <Progress value={cohort.progress.percent} className="mt-2 w-full max-w-xs" />
          <p className="text-xs font-medium text-muted-foreground">{cohort.progress.percent}% complete</p>
        </div>

        <Link
          href={`/student/learning/${cohort.id}`}
          className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Open cohort <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
