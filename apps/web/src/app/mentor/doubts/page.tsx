import { MentorDoubtsView } from "@/features/mentor-chat/components/mentor-doubts-view";
import { PageHeading } from "@/components/common/page-heading";

export default function MentorDoubtsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Student Doubts & Q&A"
        description="Review questions submitted by your mentees, provide guidance, and clear doubts directly"
      />
      <MentorDoubtsView />
    </div>
  );
}
