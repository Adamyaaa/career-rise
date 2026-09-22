import { CohortRequestsView } from "@/features/cohort/components/cohort-requests-view";
import { PageHeading } from "@/components/common/page-heading";

export default function AdminCohortRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Cohort Access Requests"
        description="Review and manage student cohort access requests across all courses"
      />
      <CohortRequestsView />
    </div>
  );
}
