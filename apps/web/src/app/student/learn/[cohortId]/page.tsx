"use client";

import { use } from "react";
import { LearnShell } from "@/features/learn/components/learn-shell";

export default function StudentCohortLearnPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = use(params);

  return <LearnShell cohortId={cohortId} />;
}
