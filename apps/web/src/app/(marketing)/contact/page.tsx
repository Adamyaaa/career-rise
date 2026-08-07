import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/features/marketing/components/page-header";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        description="Questions about a cohort, mentorship, or bringing Career Rise to your team — we read every message."
      />

      <section className="border-t border-border/60">
        <div className="mx-auto flex max-w-2xl flex-col items-start gap-3 px-4 py-20 sm:px-6 lg:px-8">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="size-4.5" />
          </span>
          <h3 className="text-base font-medium text-foreground">Email us directly</h3>
          <p className="text-sm text-muted-foreground">
            <a href="mailto:hello@careerrise.app" className="font-medium text-foreground hover:underline">
              hello@careerrise.app
            </a>{" "}
            — we typically reply within one business day.
          </p>
        </div>
      </section>
    </>
  );
}
