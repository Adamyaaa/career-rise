import { mockDelay } from "@/lib/mock-delay";
import { mockNotifications, mockAnnouncements } from "@/lib/mock-seed";
import type { Notification, Announcement } from "@/types/notification";

// MOCK — no Notifications/Announcements module in the approved API contract yet;
// entirely frontend-invented ahead of that backend design work.
export const notificationsService = {
  list: (): Promise<Notification[]> => mockDelay(mockNotifications),
  markRead: (id: string): Promise<{ success: true }> => mockDelay({ success: true }, 200),
  markAllRead: (): Promise<{ success: true }> => mockDelay({ success: true }, 200),
};

export const announcementsService = {
  list: (cohortId?: string): Promise<Announcement[]> =>
    mockDelay(mockAnnouncements.filter((a) => !cohortId || a.cohortId === cohortId)),

  create: (input: { cohortId: string; title: string; body: string; authorName: string }): Promise<Announcement> =>
    mockDelay(
      { id: `ann-${Date.now()}`, cohortName: "Agentic AI · Cohort 3", createdAt: new Date().toISOString(), ...input },
      600,
    ),
};
