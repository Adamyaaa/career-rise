import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Map,
  User,
  CalendarCheck,
  ClipboardCheck,
  Megaphone,
  Users,
  GraduationCap,
  Building2,
  Settings,
  Library,
} from "lucide-react";
import type { Role } from "@/types/user";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/student/courses", icon: BookOpen },
  { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
  { label: "Resources", href: "/student/resources", icon: Library },
  { label: "Progress", href: "/student/progress", icon: TrendingUp },
  { label: "Roadmap", href: "/student/roadmap", icon: Map },
  { label: "Profile", href: "/student/profile", icon: User },
];

export const mentorNav: NavItem[] = [
  { label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/mentor/attendance", icon: CalendarCheck },
  { label: "Evidence reviews", href: "/mentor/reviews", icon: ClipboardCheck },
  { label: "Resources", href: "/mentor/resources", icon: Library },
  { label: "Announcements", href: "/mentor/announcements", icon: Megaphone },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: GraduationCap },
  { label: "Cohorts", href: "/admin/cohorts", icon: Building2 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function navForRole(role: Role): NavItem[] {
  if (role === "STUDENT") return studentNav;
  if (role === "MENTOR") return mentorNav;
  return adminNav;
}
