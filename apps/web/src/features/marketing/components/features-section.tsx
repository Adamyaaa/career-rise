import {
  CalendarClock,
  FileCheck2,
  MessageSquareText,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/common/reveal";

const features = [
  {
    icon: Users,
    title: "Cohort-based learning",
    description:
      "Move through the material alongside a cohort of peers on a shared schedule — not alone in a self-paced void.",
  },
  {
    icon: CalendarClock,
    title: "Any session format",
    description:
      "Classroom, webinar, workshop, or self-paced — sessions adapt to how your program actually runs, not the other way around.",
  },
  {
    icon: FileCheck2,
    title: "Learning evidence",
    description:
      "Submit real evidence of your work — repos, documents, recordings, links — and build a portfolio as you go.",
  },
  {
    icon: MessageSquareText,
    title: "Mentor feedback",
    description:
      "Get scored, criterion-based feedback from a mentor on every submission — not just a pass/fail grade.",
  },
  {
    icon: TrendingUp,
    title: "Progress & roadmap",
    description:
      "Attendance, evidence, and reviews roll up into one weighted progress signal, tracked against your roadmap.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted learning",
    description:
      "Ask AI, generate quizzes, and surface weak topics — built into every lesson as you work through it.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a cohort program needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            One platform for the whole learning journey — no matter how a
            session gets delivered.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={0.05 * (i % 3)}>
              <Card className="h-full">
                <CardHeader>
                  <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-4.5" />
                  </span>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
