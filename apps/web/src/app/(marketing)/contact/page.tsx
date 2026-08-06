import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHeader } from "@/features/marketing/components/page-header";
import { ContactForm } from "@/features/marketing/components/contact-form";
import { Reveal } from "@/components/common/reveal";

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
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <Reveal className="flex flex-col gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-4.5" />
            </span>
            <h3 className="text-base font-medium text-foreground">Email us directly</h3>
            <p className="text-sm text-muted-foreground">
              hello@careerrise.app — or use the form and we&apos;ll route it to the right
              person.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
