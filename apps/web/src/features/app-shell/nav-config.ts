import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FolderOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  MessagesSquare,
  UserCheck,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student/learning", icon: LayoutDashboard },
  { label: "Learn", href: "/student/learn", icon: BookOpen },
  { label: "My Cohorts", href: "/student/cohorts", icon: Layers },
  { label: "1:1 Mentorship", href: "/student/mentorship", icon: Users },
  { label: "Resources", href: "/student/resources", icon: FolderOpen },
];

export const mentorNav: NavItem[] = [
  { label: "My Cohorts", href: "/mentor/cohorts", icon: GraduationCap },
  { label: "Student Doubts", href: "/mentor/doubts", icon: MessagesSquare },
  { label: "Cohort Requests", href: "/mentor/requests", icon: UserCheck },
  { label: "Mentorship", href: "/mentor/mentorship", icon: Users },
  { label: "Resources", href: "/mentor/resources", icon: FolderOpen },
];

export const adminNav: NavItem[] = [
  { label: "People", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Cohorts", href: "/admin/cohorts", icon: Layers },
  { label: "Cohort Requests", href: "/admin/requests", icon: UserCheck },
  { label: "Mentorship", href: "/admin/mentorship", icon: Users },
  { label: "Resources", href: "/admin/resources", icon: FolderOpen },
];
