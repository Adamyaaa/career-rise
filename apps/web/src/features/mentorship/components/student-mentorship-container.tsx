"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { mentorshipService } from "@/services/mentorship.service";
import { PersonalTrackView } from "./personal-track-view";
import { PendingApplicationView } from "./pending-application-view";
import { MentorshipCurriculumPreview } from "./mentorship-curriculum-preview";

export function StudentMentorshipContainer() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-pro-track"],
    queryFn: () => mentorshipService.getMyTrack(),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm text-destructive">
        Failed to load mentorship status. Please try refreshing the page.
      </div>
    );
  }

  // 1. Approved Student: Show full 12-Week Personal Tracker
  if (data?.isApproved && data.track) {
    return <PersonalTrackView track={data.track} canManage={false} />;
  }

  // 2. Pending Application: Show "Under Review" status
  if (data?.applicationStatus === "pending") {
    return <PendingApplicationView application={data.application} />;
  }

  // 3. Regular Student (Not applied or other status): Show Curriculum Preview & Apply CTA
  return <MentorshipCurriculumPreview />;
}
