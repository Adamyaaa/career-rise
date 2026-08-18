"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronRight, Check } from "lucide-react";
import { ApplyMentorshipDialog } from "@/features/marketing/components/apply-mentorship-dialog";
import { Reveal } from "@/components/common/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// FAQ Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/60 py-4 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left font-medium text-foreground hover:text-foreground/80"
      >
        <span>{question}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{answer}</p>}
    </div>
  );
}

export default function MentorshipPage() {
  return (
    <>
      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pb-24">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">Career Rise Mentorship</Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl text-foreground">
            12 weeks. 12 sessions. One career move, done right.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
            A structured 1:1 mentorship program for students and professionals who are done with generic advice — and ready for a plan they can actually execute.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <ApplyMentorshipDialog>
              <Button size="lg">Apply for Mentorship</Button>
            </ApplyMentorshipDialog>
            <Button render={<Link href="#how-it-works" />} variant="outline" size="lg">
              See how it works
            </Button>
          </div>
        </Reveal>
      </section>

      {/* SECTION 2: WHAT THIS IS */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center text-balance">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
              Mentorship, built as a real program
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                Most career mentorship is a handful of calls with someone busy. It ends when you run out of questions, and you're left assembling the plan yourself.
              </p>
              <p>
                Career Rise Mentorship is the opposite. Every student gets a fixed program: 12 sessions across 12 weeks, with a defined start, a defined end, and a written plan built in Week 1.
              </p>
              <p>
                Your senior mentor anchors the strategy — the kickoff, the recalibration, the offer prep, the close. Around those sessions, our specialists deliver the execution: resume and LinkedIn overhaul, domain preparation, mock interviews, portfolio review, and salary negotiation.
              </p>
              <p className="font-medium text-foreground">
                You are not buying access to someone's calendar. You are enrolling in a program.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 3: WHO YOU'RE LEARNING FROM */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">A senior mentor team, not a marketplace</h2>
            <p className="mt-4 text-muted-foreground text-balance max-w-2xl mx-auto">
              Every session in Career Rise Mentorship is delivered by a senior mentor or a vetted specialist from our roster. The mentor team is small on purpose — quality is easier to defend when the group is tight.
            </p>
          </Reveal>
          
          <Reveal delay={0.1} className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-8">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-primary">4</span>
              <span className="mt-2 text-sm text-muted-foreground text-center">Senior mentors on the program</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-primary">25+</span>
              <span className="mt-2 text-sm text-muted-foreground text-center">Combined years of industry experience</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-primary">IIM</span>
              <span className="mt-2 text-sm text-muted-foreground text-center">MBA credentials across the mentor team</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
              <span className="text-4xl font-bold text-primary">8+</span>
              <span className="mt-2 text-sm text-muted-foreground text-center">Years in the senior mentor seat</span>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="mt-12 space-y-4 max-w-2xl mx-auto text-muted-foreground text-balance">
            <p>
              Our senior mentors are MBA graduates from IIMs and top international programs, with combined experience across firms like Microsoft, EY, and L&T. Every mentor has hired, interviewed, or coached talent across the roles our students target.
            </p>
            <p>
              You are introduced to your specific senior mentor on the intake call. From that point on, you know exactly who is anchoring your program.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">How it works</h2>
            <p className="mt-3 text-muted-foreground">Four steps from application to enrolment. Nothing hidden.</p>
          </Reveal>

          <div className="mt-16 relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border/80 sm:-translate-x-px" />
            <div className="space-y-12">
              <Reveal delay={0.1} className="relative flex flex-col sm:flex-row items-start sm:items-center">
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm ring-4 ring-muted/20 z-10">1</div>
                <div className="pl-12 sm:pl-0 sm:pr-12 w-full sm:w-1/2 sm:text-right">
                  <h3 className="font-semibold text-foreground">Apply</h3>
                  <p className="mt-1 text-sm text-muted-foreground text-balance sm:ml-auto">Fill out the intake form. Tell us where you are, what you're targeting, and what your timeline looks like.</p>
                </div>
                <div className="hidden sm:block sm:w-1/2" />
              </Reveal>
              <Reveal delay={0.2} className="relative flex flex-col sm:flex-row items-start sm:items-center">
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm ring-4 ring-muted/20 z-10">2</div>
                <div className="hidden sm:block sm:w-1/2" />
                <div className="pl-12 w-full sm:w-1/2">
                  <h3 className="font-semibold text-foreground">Intake call</h3>
                  <p className="mt-1 text-sm text-muted-foreground text-balance">A 20-minute call with our program team. We understand your goals, assess fit, and recommend the plan that matches your situation.</p>
                </div>
              </Reveal>
              <Reveal delay={0.3} className="relative flex flex-col sm:flex-row items-start sm:items-center">
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm ring-4 ring-muted/20 z-10">3</div>
                <div className="pl-12 sm:pl-0 sm:pr-12 w-full sm:w-1/2 sm:text-right">
                  <h3 className="font-semibold text-foreground">Enroll and get matched</h3>
                  <p className="mt-1 text-sm text-muted-foreground text-balance sm:ml-auto">Your senior mentor is assigned. Specialists are matched to your target role. Your Week 1 kickoff is scheduled within 5 working days of enrolment.</p>
                </div>
                <div className="hidden sm:block sm:w-1/2" />
              </Reveal>
              <Reveal delay={0.4} className="relative flex flex-col sm:flex-row items-start sm:items-center">
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-sm ring-4 ring-muted/20 z-10">4</div>
                <div className="hidden sm:block sm:w-1/2" />
                <div className="pl-12 w-full sm:w-1/2">
                  <h3 className="font-semibold text-foreground">12 weeks of structured delivery</h3>
                  <p className="mt-1 text-sm text-muted-foreground text-balance">One session per week. Every session produces a written outcome — a revised resume, a mock feedback report, a strategy document. Nothing is left to memory.</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CHOOSE YOUR PLAN */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Two plans. Same commitment. Different depth.</h2>
            <p className="mt-4 text-muted-foreground">
              Both plans run 12 weeks with 12 sessions. What differs is how much of the program is led by your senior mentor, the seniority of your specialist team, and the depth of support around each session.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12 overflow-x-auto">
            <Table className="min-w-[600px] border">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-1/3 font-semibold"></TableHead>
                  <TableHead className="w-1/3 font-semibold text-primary">Starter</TableHead>
                  <TableHead className="w-1/3 font-semibold text-primary">Pro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Best for</TableCell>
                  <TableCell>Freshers and early-career professionals</TableCell>
                  <TableCell>Career switchers and senior candidates</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Experience</TableCell>
                  <TableCell>0–2 years</TableCell>
                  <TableCell>3+ years</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Total sessions</TableCell>
                  <TableCell>12</TableCell>
                  <TableCell>12</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Duration</TableCell>
                  <TableCell>12 weeks</TableCell>
                  <TableCell>12 weeks</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Senior mentor sessions</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>6</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Session length (senior mentor)</TableCell>
                  <TableCell>60 min</TableCell>
                  <TableCell>75 min</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Format</TableCell>
                  <TableCell>11 1:1 sessions + 1 group interview-prep workshop</TableCell>
                  <TableCell>All 12 sessions 1:1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Mock interviews</TableCell>
                  <TableCell>3 (all 1:1)</TableCell>
                  <TableCell>2 (all 1:1, senior specialists)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Specialist track</TableCell>
                  <TableCell>Standard roster</TableCell>
                  <TableCell>Senior specialists only</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Portfolio work</TableCell>
                  <TableCell>45-min review</TableCell>
                  <TableCell>60-min deep dive</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Negotiation coaching</TableCell>
                  <TableCell>Specialist-led</TableCell>
                  <TableCell>Led by your senior mentor</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Offer decision consult</TableCell>
                  <TableCell className="text-muted-foreground">-</TableCell>
                  <TableCell>Included</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium bg-muted/20">Async support</TableCell>
                  <TableCell>2 questions/week</TableCell>
                  <TableCell>4 questions/week</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Reveal>
          <Reveal delay={0.2} className="mt-8 flex justify-center">
            <ApplyMentorshipDialog>
              <Button size="lg">Apply for Mentorship</Button>
            </ApplyMentorshipDialog>
          </Reveal>
        </div>
      </section>

      {/* SECTION 6: YOUR 12 WEEKS, MAPPED OUT */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Your 12 weeks, mapped out</h2>
            <p className="mt-3 text-muted-foreground">Every session has a purpose and a place in the sequence. Nothing is filler.</p>
          </Reveal>

          <Reveal delay={0.1} className="space-y-12">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Starter</h3>
              <div className="overflow-x-auto rounded-xl border bg-card">
                <Table className="min-w-[600px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-16 text-center">Week</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Format</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { w: 1, s: "Kickoff: goals, gap analysis, 12-week plan", f: "1:1 with your senior mentor" },
                      { w: 2, s: "Resume + LinkedIn overhaul", f: "1:1 with specialist, revised documents delivered" },
                      { w: 3, s: "Domain session #1: target-role foundations", f: "1:1 with specialist" },
                      { w: 4, s: "Interview prep workshop: frameworks, STAR, common mistakes", f: "Group of 3, specialist-led" },
                      { w: 5, s: "Mock interview #1: behavioural", f: "1:1 with specialist, written feedback" },
                      { w: 6, s: "Domain session #2: role-specific depth", f: "1:1 with specialist" },
                      { w: 7, s: "Midpoint recalibration", f: "1:1 with your senior mentor" },
                      { w: 8, s: "Mock interview #2: domain", f: "1:1 with specialist, written feedback" },
                      { w: 9, s: "Portfolio and profile review", f: "1:1 with specialist" },
                      { w: 10, s: "Mock interview #3: final-round style", f: "1:1 with specialist, written feedback" },
                      { w: 11, s: "Salary negotiation prep", f: "1:1 with specialist" },
                      { w: 12, s: "Close: application strategy, next 90 days", f: "1:1 with your senior mentor" }
                    ].map((row) => (
                      <TableRow key={row.w}>
                        <TableCell className="text-center font-medium bg-muted/10">{row.w}</TableCell>
                        <TableCell>{row.s}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.f}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Pro</h3>
              <div className="overflow-x-auto rounded-xl border bg-card">
                <Table className="min-w-[600px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-16 text-center">Week</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Format</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { w: 1, s: "Kickoff: career audit, positioning, 12-week plan", f: "1:1 with your senior mentor, 75 min" },
                      { w: 2, s: "Resume + LinkedIn overhaul", f: "1:1 with senior specialist, revised documents delivered" },
                      { w: 3, s: "Portfolio and profile deep dive", f: "1:1 with senior specialist" },
                      { w: 4, s: "Positioning and senior-role narrative", f: "1:1 with your senior mentor, 75 min" },
                      { w: 5, s: "Domain session #1: senior-role preparation", f: "1:1 with senior specialist" },
                      { w: 6, s: "Application strategy and target-company selection", f: "1:1 with your senior mentor, 75 min" },
                      { w: 7, s: "Mock interview #1: behavioural", f: "1:1 with senior specialist, written feedback" },
                      { w: 8, s: "Midpoint recalibration", f: "1:1 with your senior mentor, 75 min" },
                      { w: 9, s: "Domain session #2: technical and leadership scenarios", f: "1:1 with senior specialist" },
                      { w: 10, s: "Mock interview #2: domain and technical", f: "1:1 with senior specialist, written feedback" },
                      { w: 11, s: "Offer strategy and negotiation coaching", f: "1:1 with your senior mentor, 75 min" },
                      { w: 12, s: "Close: transition strategy, 90-day plan in the new role", f: "1:1 with your senior mentor, 75 min" }
                    ].map((row) => (
                      <TableRow key={row.w}>
                        <TableCell className="text-center font-medium bg-muted/10">{row.w}</TableCell>
                        <TableCell>{row.s}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.f}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 7: WHAT YOU WALK AWAY WITH */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">What you actually leave with</h2>
            <p className="mt-3 text-muted-foreground">Concrete deliverables, not just conversations.</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-12 text-left bg-card border rounded-2xl p-6 sm:p-10 shadow-sm">
            <ul className="space-y-4">
              {[
                "A revised resume and LinkedIn profile, launch-ready for your target roles",
                "Written feedback from every mock interview, with specific patterns to fix",
                "A domain preparation plan built around the roles you are targeting",
                "A negotiation framework for handling offers, counters, and multiple-offer situations",
                "A 90-day plan for what happens after the program ends",
                "(Pro) A portfolio audit and rebuild plan",
                "(Pro) An offer decision framework when you have multiple offers to weigh"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* SECTION 8: WHO THIS IS FOR */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Is this the right program for you?</h2>
          </Reveal>

          <Reveal delay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-primary mb-4">This is for you if you are:</h3>
                <ul className="space-y-3 text-sm text-foreground">
                  {[
                    "Actively job-hunting, not just exploring",
                    "Ready to commit one session a week for 12 weeks",
                    "Willing to do the work between sessions",
                    "Targeting a specific role or a specific transition",
                    "Looking for a structured plan, not general advice"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-destructive mb-4">This is not for you if you are:</h3>
                <ul className="space-y-3 text-sm text-foreground">
                  {[
                    "Looking for a quick fix or a one-off coaching call",
                    "Not currently able to commit weekly time",
                    "Expecting the mentor to do the applying and interviewing for you",
                    "Looking for job placement or referrals (this is mentorship, not recruiting)"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="size-4 shrink-0 text-destructive mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Common questions</h2>
          </Reveal>

          <Reveal delay={0.1} className="border-t border-border/60">
            {[
              {
                q: "How is this different from a career coach?",
                a: "A one-off career coach gives you advice. This program gives you a plan, a team to execute it with, and written outputs at every step. It runs for a fixed 12 weeks with a defined end, not open-ended."
              },
              {
                q: "Who are the specialists?",
                a: "Practitioners with hiring experience across the roles our students target. Every specialist is vetted through a screening call, a sample session, and a live beta session before they deliver to paying students."
              },
              {
                q: "What if my specialist is not the right fit?",
                a: "You can request a specialist swap once per session type, no questions asked. Your senior mentor also gets involved if there is a broader pattern to address."
              },
              {
                q: "Can I pause the program?",
                a: "Yes, once per program, for up to 30 days. Beyond that the program is considered complete."
              },
              {
                q: "What if I get a job halfway through?",
                a: "Even better. The remaining sessions shift to onboarding preparation, negotiation, and 90-day planning for your new role."
              },
              {
                q: "Do I get to choose Starter or Pro?",
                a: "The intake call determines the right plan for your situation. Both plans are available to anyone who fits the profile, but we will not enroll a student in the wrong tier — it wastes their money and our team's time."
              },
              {
                q: "How do I pay?",
                a: "Payment terms are yet to be decided and will be announced soon. In the meantime, you can apply and secure a spot for the intake call."
              }
            ].map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section className="border-t border-border/60 bg-primary/5">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Ready to start?</h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance mx-auto max-w-2xl">
              The next step is the intake call. Twenty minutes. No commitment. If we think you are a fit for either plan, we will tell you which one and why. If we think you are not, we will tell you that too.
            </p>
            <div className="mt-10 flex justify-center">
              <ApplyMentorshipDialog>
                <Button size="lg">Apply for Mentorship</Button>
              </ApplyMentorshipDialog>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
