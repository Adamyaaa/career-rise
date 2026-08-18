export const siteConfig = {
  name: "Career Rise",
  tagline: "Cohort-based learning, built to get you hired",
  description:
    "Join a cohort, work through real lessons and activities, submit evidence of your learning, and get direct feedback from mentors, all tracked on one roadmap.",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const marketingNavLinks: NavLink[] = [
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "1:1 Mentorship", href: "/mentorship" },
];

export const footerLinkGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Courses", href: "/#courses" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];
