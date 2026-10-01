import { AdminMentorshipView } from "@/features/mentorship/components/admin-mentorship-view";
import { PageHeading } from "@/components/common/page-heading";

export default function AdminMentorshipPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="1:1 Pro Mentorship Management"
        description="Review applicants, assign senior mentors, and track 12-week personal records"
      />
      <AdminMentorshipView />
    </div>
  );
}
