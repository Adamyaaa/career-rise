import { MentorMentorshipView } from "@/features/mentorship/components/mentor-mentorship-view";
import { PageHeading } from "@/components/common/page-heading";

export default function MentorMentorshipPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="1:1 Pro Mentees"
        description="Manage your assigned mentees' 12-week roadmaps, schedule calls, and record session feedback"
      />
      <MentorMentorshipView />
    </div>
  );
}
