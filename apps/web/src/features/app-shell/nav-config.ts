import type { LucideIcon } from "lucide-react";
import { User, Library, GraduationCap } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { label: "My Learning", href: "/student/learning", icon: GraduationCap },
  { label: "Resources", href: "/student/resources", icon: Library },
  { label: "Profile", href: "/student/profile", icon: User },
];

export const mentorNav: NavItem[] = [
  { label: "Resources", href: "/mentor/resources", icon: Library },
];
