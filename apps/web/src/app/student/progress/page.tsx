"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/common/page-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressHistoryChart } from "@/features/student/components/progress-history-chart";
import { progressService } from "@/services/progress.service";
import { currentMockStudentId } from "@/lib/mock-seed";
import { formatPercent } from "@/lib/format";

const SID = currentMockStudentId;
const COHORT_ID = "cohort-1";

export default function ProgressPage() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress", SID, COHORT_ID],
    queryFn: () => progressService.getProgress(SID, COHORT_ID),
  });
  const { data: history } = useQuery({
    queryKey: ["progress-history", SID, COHORT_ID],
    queryFn: () => progressService.getProgressHistory(SID, COHORT_ID),
  });

  return (
    <>
      <PageHeading title="Progress" description="How attendance, evidence, and reviews add up." />

      {isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">Overall progress</p>
            <p className="text-4xl font-semibold text-foreground">{formatPercent(progress?.overall ?? 0)}</p>
            <Progress value={(progress?.overall ?? 0) * 100} className="mt-2 w-full max-w-xs" />
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signal breakdown</CardTitle>
            <CardDescription>Each signal is weighted differently per cohort.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {progress?.signals.map((signal) => (
              <div key={signal.signalType} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{signal.label}</span>
                  <span className="text-muted-foreground">
                    {formatPercent(signal.value)} · weight {formatPercent(signal.weight)}
                  </span>
                </div>
                <Progress value={signal.value * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress over time</CardTitle>
            <CardDescription>Weighted overall progress, by week.</CardDescription>
          </CardHeader>
          <CardContent>{history && <ProgressHistoryChart data={history} />}</CardContent>
        </Card>
      </div>
    </>
  );
}
