import type { LucideIcon } from "lucide-react";
import { User, Library } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const studentNav: NavItem[] = [
  { label: "Profile", href: "/student/profile", icon: User },
  { label: "Resources", href: "/student/resources", icon: Library },
];

export const mentorNav: NavItem[] = [
  { label: "Resources", href: "/mentor/resources", icon: Library },
];
