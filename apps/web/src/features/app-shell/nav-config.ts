import type { LucideIcon } from "lucide-react";
import { User, GraduationCap, Users, BookOpen, Layers, UserCheck } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { label: "My Learning", href: "/student/learning", icon: GraduationCap },
  { label: "Mentorship", href: "/mentorship", icon: Users },
  { label: "Profile", href: "/student/profile", icon: User },
];

export const mentorNav: NavItem[] = [
  { label: "My Cohorts", href: "/mentor/cohorts", icon: GraduationCap },
  { label: "Cohort Requests", href: "/mentor/requests", icon: UserCheck },
  { label: "Mentorship", href: "/mentor/mentorship", icon: Users },
];

export const adminNav: NavItem[] = [
  { label: "People", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Cohorts", href: "/admin/cohorts", icon: Layers },
  { label: "Cohort Requests", href: "/admin/requests", icon: UserCheck },
  { label: "Mentorship", href: "/admin/mentorship", icon: Users },
];
