"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";
import { CohortHeader } from "@/features/cohort/components/cohort-header";
import { CohortAnnouncements } from "@/features/cohort/components/cohort-announcements";
import { CohortSubmissions } from "@/features/student/components/cohort-submissions";
import { CohortProgressPanel } from "@/features/student/components/cohort-progress";
import { ModuleCard } from "@/features/student/components/module-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { learningService } from "@/services/learning.service";

export default function CohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const { cohortId } = use(params);

  const { data: modules, isLoading } = useQuery({
    queryKey: ["cohort-modules", cohortId],
    queryFn: () => learningService.getCohortModules(cohortId),
  });

  return (
    <>
      <CohortHeader cohortId={cohortId} />

      {isLoading && (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && modules && (
        <Tabs defaultValue="learnings">
          <TabsList variant="line">
            <TabsTrigger value="learnings">Your learnings</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="learnings" className="mt-6">
            {modules.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No modules yet"
                description="Once your mentor builds the study plan, its modules will appear here."
              />
            ) : (
              // Centered so the grid stays balanced rather than hugging the left edge on
              // wide screens, and the cards keep a readable width.
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    index={index}
                    href={`/student/learning/${cohortId}/modules/${module.id}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <CohortSubmissions cohortId={cohortId} canManage={false} />
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            <CohortAnnouncements cohortId={cohortId} canManage={false} />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <CohortProgressPanel cohortId={cohortId} modules={modules} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
