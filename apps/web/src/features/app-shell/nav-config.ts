import type { LucideIcon } from "lucide-react";
import { User, GraduationCap } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { label: "My Learning", href: "/student/learning", icon: GraduationCap },
  { label: "Profile", href: "/student/profile", icon: User },
];

export const mentorNav: NavItem[] = [
  { label: "My Cohorts", href: "/mentor/cohorts", icon: GraduationCap },
];
