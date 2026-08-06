import type { Metadata } from "next";
import {
  BookOpen,
  FileCheck2,
  MessageSquareText,
  TrendingUp,
  Users,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Wand2,
  FileQuestion,
  Layers,
  Target,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/features/marketing/components/page-header";
import { Reveal } from "@/components/common/reveal";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Features" };

const studentFeatures = [
  { icon: BookOpen, title: "Lessons & resources", description: "Structured modules and lessons with linked slides, recordings, and reading — organized per cohort." },
  { icon: FileCheck2, title: "Learning evidence", description: "Submit repos, documents, recordings, or links as proof of work — build a portfolio while you learn." },
  { icon: TrendingUp, title: "Progress & roadmap", description: "See attendance, evidence, and review scores roll up into one weighted progress signal." },
];

const mentorFeatures = [
  { icon: ClipboardCheck, title: "Review queue", description: "A pre-filtered, oldest-first queue of evidence waiting on your feedback." },
  { icon: MessageSquareText, title: "Criterion-based reviews", description: "Score submissions against a rubric your cohort defines, not a single pass/fail toggle." },
  { icon: Users, title: "Attendance & roster", description: "Mark attendance per session and see every student's standing at a glance." },
];

const platformFeatures = [
  { icon: BarChart3, title: "Cohort & course admin", description: "Stand up new cohorts, assign mentors by specialization and load, manage rosters." },
  { icon: ShieldCheck, title: "Role-based access", description: "Student, mentor, and admin areas are strictly separated at the API layer, not just the UI." },
  { icon: Layers, title: "Any delivery format", description: "Classroom, webinar, workshop, or self-paced — sessions are configured, not hardcoded." },
];

const aiPlaceholders = [
  { icon: Sparkles, title: "Ask AI" },
  { icon: FileQuestion, title: "Generate quiz" },
  { icon: Wand2, title: "Summarize resource" },
  { icon: Layers, title: "Generate flashcards" },
  { icon: Target, title: "Weak topic analysis" },
  { icon: ArrowRight, title: "Next best action" },
];

function FeatureGroup({
  eyebrow,
  title,
  features,
}: {
  eyebrow: string;
  title: string;
  features: { icon: typeof BookOpen; title: string; description: string }[];
}) {
  return (
    <div>
      <Reveal>
        <p className="text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      </Reveal>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {features.map((feature, i) => (
          <Reveal key={feature.title} delay={0.05 * i}>
            <Card className="h-full">
              <CardHeader>
                <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-4.5" />
                </span>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Features"
        title="One platform, three roles, one journey"
        description="The student journey stays identical no matter how a session is delivered — mentors and admins get purpose-built tools around it."
      />

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
          <FeatureGroup eyebrow="For students" title="Learn, submit, get feedback" features={studentFeatures} />
          <FeatureGroup eyebrow="For mentors" title="Review with context, not chaos" features={mentorFeatures} />
          <FeatureGroup eyebrow="For admins" title="Run the whole program" features={platformFeatures} />
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <Badge variant="secondary">Coming to every lesson</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              AI-assisted, everywhere it helps
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground text-balance">
              These are wired into the UI today as placeholders — the AI service is a
              separate integration the core platform never depends on.
            </p>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            {aiPlaceholders.map((item, i) => (
              <Reveal
                key={item.title}
                delay={0.03 * i}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-card px-4 py-6"
              >
                <item.icon className="size-4.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{item.title}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
