"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { mentorshipService } from "@/services/mentorship.service";
import { PersonalSessionDetailView } from "@/features/mentorship/components/personal-session-detail-view";

export default function MentorMentorshipSessionPage({
  params,
}: {
  params: Promise<{ trackId: string; sessionId: string }>;
}) {
  const { trackId, sessionId } = use(params);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["mentorship-session", sessionId],
    queryFn: () => mentorshipService.getSessionById(sessionId),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Session not found"
        description="This mentorship session could not be found or you do not have permission to edit it."
      />
    );
  }

  return (
    <PersonalSessionDetailView
      session={session}
      backHref="/mentor/mentorship"
      canManage={true}
    />
  );
}
