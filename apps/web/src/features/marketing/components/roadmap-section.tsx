"use client";

import { useState } from "react";
import {
  Compass,
  FileCode2,
  GitPullRequest,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/common/reveal";

interface Milestone {
  id: string;
  phase: string;
  weeks: string;
  title: string;
  description: string;
  deliverable: string;
  evidence: string;
  mentorScore: string;
  status: "completed" | "in-progress" | "upcoming";
  checklist: string[];
}

const milestones: Milestone[] = [
  {
    id: "m1",
    phase: "Phase 01",
    weeks: "Weeks 1–3",
    title: "Foundations & System Architecture",
    description:
      "Form your cohort study group, break down production agent design patterns, and write your first system architecture RFC.",
    deliverable: "Agent Architecture RFC & Scaffold",
    evidence: "GitHub PR #1: System Schema & Env Setup",
    mentorScore: "5.0 / 5.0",
    status: "completed",
    checklist: [
      "Define agent memory boundaries",
      "Configure deterministic evaluation harness",
      "Cohort kickoff & peer review pair matching",
    ],
  },
  {
    id: "m2",
    phase: "Phase 02",
    weeks: "Weeks 4–6",
    title: "Autonomous Tool Use & Memory",
    description:
      "Implement structured tool schemas, vector search retrieval, and short/long-term persistence with verified error fallback strategies.",
    deliverable: "Multi-Tool Execution Engine",
    evidence: "GitHub PR #5: Custom Tool Protocol & Vector Cache",
    mentorScore: "4.8 / 5.0",
    status: "in-progress",
    checklist: [
      "Build JSON schema tool validation layer",
      "Implement conversation state rehydration",
      "Live 1:1 mentor code walkthrough",
    ],
  },
  {
    id: "m3",
    phase: "Phase 03",
    weeks: "Weeks 7–9",
    title: "Multi-Agent Networks & Evals",
    description:
      "Design hierarchical multi-agent supervisor networks, synthesize synthetic evaluation datasets, and benchmark latency and accuracy.",
    deliverable: "Supervisor & Worker Orchestration",
    evidence: "Evaluation Benchmark Suite & Demo Video",
    mentorScore: "4.9 / 5.0",
    status: "upcoming",
    checklist: [
      "Router & specialist agent delegation",
      "Automated regression test runner",
      "Mid-cohort peer critique session",
    ],
  },
  {
    id: "m4",
    phase: "Phase 04",
    weeks: "Weeks 10–12",
    title: "Capstone Defense & Career Showcase",
    description:
      "Deploy your production agent, defend your architecture live in front of engineering mentors, and publish your verified portfolio.",
    deliverable: "Production Cloud Deployment",
    evidence: "Verified CareerRise Portfolio & Mentor Recommendation",
    mentorScore: "Target: 5.0 / 5.0",
    status: "upcoming",
    checklist: [
      "Containerized deployment on cloud infra",
      "Live architecture defense & Q&A",
      "Public credential & recruiter showcase",
    ],
  },
];

export function RoadmapSection() {
  const [activeId, setActiveId] = useState<string>("m2");
  const shouldReduceMotion = useReducedMotion();

  const activeMilestone =
    milestones.find((m) => m.id === activeId) || milestones[1];

  return (
    <section id="roadmap" className="relative border-t border-slate-200/60 bg-white py-20 sm:py-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] bg-blue-100/30 blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-blue-200">
            <Compass className="size-3.5" />
            The 12-Week Living Roadmap
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Track real progress from Day 1 to portfolio defense.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            Every week has explicit evidence deliverables. Watch your progress signals, mentor reviews, and verified repositories roll up into one transparent curriculum.
          </p>
        </Reveal>

        {/* Interactive SVG Progress Timeline Bar */}
        <div className="mt-14 max-w-4xl mx-auto">
          {/* Milestone Tabs Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
            {milestones.map((milestone) => {
              const isActive = milestone.id === activeId;
              return (
                <button
                  key={milestone.id}
                  onClick={() => setActiveId(milestone.id)}
                  type="button"
                  className={`relative flex flex-col items-start p-3 sm:p-3.5 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {milestone.weeks}
                    </span>
                    {milestone.status === "completed" && (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    )}
                    {milestone.status === "in-progress" && (
                      <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>
                  <span className="mt-1 text-xs sm:text-sm font-medium line-clamp-1">
                    {milestone.phase}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Interactive Deliverable Showcase */}
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 shadow-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMilestone.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left: Milestone Narrative */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-primary">
                      {activeMilestone.weeks}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {activeMilestone.phase}
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
                    {activeMilestone.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {activeMilestone.description}
                  </p>

                  <div className="mt-2 flex flex-col gap-2.5">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Key Milestone Activities:
                    </p>
                    {activeMilestone.checklist.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <div className="size-1.5 rounded-full bg-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Concrete Verified Evidence Artifact Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-blue-200/80 bg-white p-5 sm:p-6 shadow-[0_12px_32px_-8px_rgba(37,99,235,0.12)]">
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="size-4 text-primary" />
                        <span className="text-xs font-bold text-slate-800">
                          Submitted Evidence
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                        <Sparkles className="size-2.5" />
                        Scored
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <div>
                        <p className="text-[11px] font-medium text-slate-400">Deliverable</p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {activeMilestone.deliverable}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 flex items-center gap-2">
                        <GitPullRequest className="size-3.5 text-primary shrink-0" />
                        <span className="text-xs text-slate-700 font-mono truncate">
                          {activeMilestone.evidence}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 font-medium">Mentor Score</span>
                        <span className="font-bold text-primary font-heading">
                          {activeMilestone.mentorScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
