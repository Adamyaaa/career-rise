import { MentorMentorshipView } from "@/features/mentorship/components/mentor-mentorship-view";
import { PageHeading } from "@/components/common/page-heading";

export default function MentorMentorshipPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="1:1 Mentorship Hub & Student Updates"
        description="Track your mentees in one place — review session requests, submissions, notes, and 12-week roadmaps"
      />
      <MentorMentorshipView />
    </div>
  );
}
