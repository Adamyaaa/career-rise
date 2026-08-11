"use client";

import { use } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StudyPlanManager } from "@/features/mentor/components/study-plan-manager";
import { CohortRoster } from "@/features/mentor/components/cohort-roster";
import { CohortFeedback } from "@/features/mentor/components/cohort-feedback";
import { CohortHeader } from "@/features/cohort/components/cohort-header";
import { CohortAnnouncements } from "@/features/cohort/components/cohort-announcements";

export default function MentorCohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = use(params);

  return (
    <>
      <CohortHeader cohortId={cohortId} />

      <Tabs defaultValue="study-plan">
        <TabsList variant="line">
          <TabsTrigger value="study-plan">Study plan</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="study-plan" className="mt-4">
          <StudyPlanManager cohortId={cohortId} />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <CohortRoster cohortId={cohortId} />
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          <CohortFeedback cohortId={cohortId} />
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <CohortAnnouncements cohortId={cohortId} canManage />
        </TabsContent>
      </Tabs>
    </>
  );
}
