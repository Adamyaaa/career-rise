"use client";

import { use } from "react";
import { LearnShell } from "@/features/learn/components/learn-shell";

export default function StudentLessonLearnPage({
  params,
}: {
  params: Promise<{ cohortId: string; lessonId: string }>;
}) {
  const { cohortId, lessonId } = use(params);

  return <LearnShell cohortId={cohortId} activeLessonId={lessonId} />;
}
