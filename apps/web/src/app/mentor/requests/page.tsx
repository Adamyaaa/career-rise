import { CohortRequestsView } from "@/features/cohort/components/cohort-requests-view";
import { PageHeading } from "@/components/common/page-heading";

export default function MentorCohortRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Cohort Access Requests"
        description="Review and approve students requesting access to cohorts"
      />
      <CohortRequestsView />
    </div>
  );
}
