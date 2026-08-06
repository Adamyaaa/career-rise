import type { Metadata } from "next";
import { LandingPage } from "@/features/marketing/landing-page";

export const metadata: Metadata = {
  title: "Career Rise — Cohort-based learning, built to get you hired",
  description:
    "Join a cohort, work through real lessons and activities, submit evidence of your learning, and get direct feedback from mentors.",
};

export default function Page() {
  return <LandingPage />;
}
