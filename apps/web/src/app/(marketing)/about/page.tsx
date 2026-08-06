import type { Metadata } from "next";
import { Target, Users2, GraduationCap } from "lucide-react";
import { PageHeader } from "@/features/marketing/components/page-header";
import { Reveal } from "@/components/common/reveal";

export const metadata: Metadata = { title: "About" };

const values = [
  {
    icon: Target,
    title: "Evidence over attendance",
    description:
      "Showing up matters, but what you can point to afterward matters more. Every module ends with something real you built.",
  },
  {
    icon: Users2,
    title: "Cohorts, not courses",
    description:
      "Learning alongside a fixed group of peers, on a shared schedule, with a mentor who knows your work — not a self-paced video library.",
  },
  {
    icon: GraduationCap,
    title: "Mentors who review, not just grade",
    description:
      "Every submission gets criterion-based feedback from a person, so you know exactly what to improve and why.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Career Rise"
        title="We built the cohort we wished we'd had"
        description="Career Rise started from a simple frustration: most technical learning platforms optimize for course completion, not for whether you could actually do the work afterward."
      />

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={0.05 * i} className="flex flex-col gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <value.icon className="size-4.5" />
                </span>
                <h3 className="text-base font-medium text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Starting with Agentic AI
            </h2>
            <p className="mt-4 text-muted-foreground text-balance">
              Our first cohort-based course teaches students to design, build, and evaluate
              autonomous AI agents — chosen because it's one of the fastest-moving areas in
              software, and exactly where evidence of real work matters most. More courses are
              on the way, all running on the same cohort, evidence, and mentorship model.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
