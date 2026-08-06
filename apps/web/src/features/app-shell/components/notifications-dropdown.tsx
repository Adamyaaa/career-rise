"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, MessageSquareText, CalendarCheck, Megaphone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { notificationsService } from "@/services/notifications.service";
import { formatRelativeTime } from "@/lib/format";
import type { Notification } from "@/types/notification";

const iconFor: Record<Notification["type"], typeof Bell> = {
  review: MessageSquareText,
  attendance: CalendarCheck,
  announcement: Megaphone,
  system: Info,
};

export function NotificationsDropdown({ notificationsHref }: { notificationsHref: string }) {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.list,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) return;
        notificationsService.markAllRead().then(() => {
          queryClient.setQueryData<Notification[]>(["notifications"], (prev) =>
            prev?.map((n) => ({ ...n, read: true })),
          );
        });
      }}
    >
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-2 rounded-full bg-primary" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium text-foreground">Notifications</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
        )}
        {notifications.slice(0, 5).map((notification) => {
          const Icon = iconFor[notification.type];
          return (
            <DropdownMenuItem key={notification.id} className="flex items-start gap-2.5 py-2">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-foreground">{notification.title}</span>
                <span className="text-xs text-muted-foreground">{notification.body}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={notificationsHref} />} className="justify-center text-sm">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
