"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, MessageSquareText, CalendarCheck, Megaphone, Info } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { notificationsService } from "@/services/notifications.service";
import { formatRelativeTime } from "@/lib/format";
import type { Notification } from "@/types/notification";

const iconFor: Record<Notification["type"], typeof Bell> = {
  review: MessageSquareText,
  attendance: CalendarCheck,
  announcement: Megaphone,
  system: Info,
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: notificationsService.list });

  return (
    <>
      <PageHeading title="Notifications" />

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}

      {!isLoading && notifications?.length === 0 && <EmptyState icon={Bell} title="No notifications" />}

      <Card>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {notifications?.map((n) => {
            const Icon = iconFor[n.type];
            return (
              <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3.5", !n.read && "bg-primary/[0.03]")}>
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
