"use client";

import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateAnnouncementDialog } from "@/features/mentor/components/create-announcement-dialog";
import { announcementsService } from "@/services/notifications.service";
import { formatRelativeTime } from "@/lib/format";

export default function MentorAnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements", "cohort-1"],
    queryFn: () => announcementsService.list("cohort-1"),
  });

  return (
    <>
      <PageHeading title="Announcements" description="Post updates to your cohort." action={<CreateAnnouncementDialog />} />

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {!isLoading && announcements?.length === 0 && (
        <EmptyState icon={Megaphone} title="No announcements yet" />
      )}

      <div className="flex flex-col gap-3">
        {announcements?.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle className="text-base">{a.title}</CardTitle>
              <CardDescription>
                {a.authorName} · {formatRelativeTime(a.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{a.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
