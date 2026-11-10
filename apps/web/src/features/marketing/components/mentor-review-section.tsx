"use client";

import { Award, Check, MessageSquareCode, Star, UserCheck } from "lucide-react";
import { Reveal } from "@/components/common/reveal";

export function MentorReviewSection() {
  const criteria = [
    { name: "System Architecture & Schema Design", score: "9.8 / 10", note: "Clean isolation between tool dispatch and memory stores." },
    { name: "Failure Recovery & Resilience", score: "9.4 / 10", note: "Deterministic retry logic gracefully handles model rate limits." },
    { name: "Benchmark & Evaluation Coverage", score: "9.6 / 10", note: "Comprehensive regression suite verifying task accuracy." },
  ];

  return (
    <section className="relative border-t border-slate-200/60 bg-slate-50/60 py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-primary">
            <UserCheck className="size-3.5" />
            Criterion-Based Critique
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Not just pass or fail. Scored feedback from senior engineers.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
            Every submission is judged against an explicit 4-part rubric. You receive actionable line-level pull request comments and scored signals that prove your mastery.
          </p>
        </Reveal>

        {/* Realistic Mentor Review Card */}
        <div className="mt-14 max-w-4xl mx-auto">
          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08)]">
              {/* Header: Mentor profile & submission badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="size-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    MC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-semibold text-base text-slate-900">
                        Marcus Chen
                      </h4>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-primary ring-1 ring-blue-200">
                        Principal AI Mentor
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reviewed Submission: <span className="font-mono text-slate-700">PR #8 · Tool Use Protocols</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-heading font-bold text-sm text-slate-900">
                    9.6 / 10 Weighted Score
                  </span>
                </div>
              </div>

              {/* Rubric Criteria Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {criteria.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col justify-between rounded-2xl bg-slate-50/80 p-4 border border-slate-100"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {item.name}
                      </span>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Score</span>
                      <span className="font-bold">{item.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Written Mentor Note & Pull Request Feedback */}
              <div className="mt-6 rounded-2xl bg-blue-50/60 p-4 sm:p-5 border border-blue-100/80 flex items-start gap-3.5">
                <MessageSquareCode className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Mentor Feedback Summary
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    &ldquo;Outstanding architectural separation in your vector index lookup. Your handling of concurrent tool calls in the retry loop shows real production readiness. I have approved your evidence submission for this milestone.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
