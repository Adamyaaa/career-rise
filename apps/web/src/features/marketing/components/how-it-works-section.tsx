import { Reveal } from "@/components/common/reveal";

const steps = [
  {
    number: "01",
    title: "Join a cohort",
    description:
      "Enroll in a cohort for your course and get access to its modules, lessons, and schedule from day one.",
  },
  {
    number: "02",
    title: "Learn & submit evidence",
    description:
      "Work through lessons and activities, attend sessions in whatever format they run, and submit evidence of what you built.",
  },
  {
    number: "03",
    title: "Grow with mentor feedback",
    description:
      "Get scored, criterion-based feedback from your mentor and watch attendance, evidence, and reviews roll up into your roadmap.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            The same journey every time, regardless of how a session is
            delivered.
          </p>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden
            className="absolute top-5 right-0 left-0 hidden h-px bg-border md:block"
          />
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={0.1 * i} className="relative flex flex-col gap-4">
              <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-foreground">
                {step.number}
              </span>
              <h3 className="text-lg font-medium text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
