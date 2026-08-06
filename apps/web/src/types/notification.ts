export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: "review" | "attendance" | "announcement" | "system";
}

export interface Announcement {
  id: string;
  cohortId: string;
  cohortName: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
}
