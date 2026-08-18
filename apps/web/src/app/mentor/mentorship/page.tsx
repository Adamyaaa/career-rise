import { MentorshipApplicationsView } from "@/features/mentorship/components/mentorship-applications-view";
import { PageHeading } from "@/components/common/page-heading";

export default function MentorMentorshipPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Mentorship Applications"
        description="Review candidates who have applied for 1:1 mentorship"
      />
      <MentorshipApplicationsView />
    </div>
  );
}
