"use client";

import { Sparkles, CalendarCheck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplyMentorshipDialog } from "@/features/marketing/components/apply-mentorship-dialog";

export const PRO_CURRICULUM_DATA = [
  {
    week: 1,
    session: "Kickoff: career audit, positioning, 12-week plan",
    format: "1:1 with your senior mentor, 75 min",
  },
  {
    week: 2,
    session: "Resume + LinkedIn overhaul",
    format: "1:1 with senior specialist, revised documents delivered",
  },
  {
    week: 3,
    session: "Portfolio and profile deep dive",
    format: "1:1 with senior specialist",
  },
  {
    week: 4,
    session: "Positioning and senior-role narrative",
    format: "1:1 with your senior mentor, 75 min",
  },
  {
    week: 5,
    session: "Domain session #1: senior-role preparation",
    format: "1:1 with senior specialist",
  },
  {
    week: 6,
    session: "Application strategy and target-company selection",
    format: "1:1 with your senior mentor, 75 min",
  },
  {
    week: 7,
    session: "Mock interview #1: behavioural",
    format: "1:1 with senior specialist, written feedback",
  },
  {
    week: 8,
    session: "Midpoint recalibration",
    format: "1:1 with your senior mentor, 75 min",
  },
  {
    week: 9,
    session: "Domain session #2: technical and leadership scenarios",
    format: "1:1 with senior specialist",
  },
  {
    week: 10,
    session: "Mock interview #2: domain and technical",
    format: "1:1 with senior specialist, written feedback",
  },
  {
    week: 11,
    session: "Offer strategy and negotiation coaching",
    format: "1:1 with your senior mentor, 75 min",
  },
  {
    week: 12,
    session: "Close: transition strategy, 90-day plan in the new role",
    format: "1:1 with your senior mentor, 75 min",
  },
];

export function MentorshipCurriculumPreview() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-background p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 font-medium">
                <Sparkles className="size-3.5" />
                Exclusive 1:1 Track
              </Badge>
              <Badge variant="outline" className="text-xs">
                Selective Admission
              </Badge>
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              12-Week Pro Mentorship Track
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Personalized 1-on-1 mentorship with dedicated senior engineering leaders and domain
              specialists. Tailored to your target company, career timeline, and interview prep.
            </p>
          </div>

          <div className="shrink-0">
            <ApplyMentorshipDialog>
              <Button size="lg" className="rounded-xl px-6 font-semibold shadow-sm">
                Apply for Pro Mentorship
              </Button>
            </ApplyMentorshipDialog>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t pt-6 text-sm">
          <div className="flex items-center gap-2.5 text-foreground">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CalendarCheck className="size-4" />
            </div>
            <span>12 Dedicated 1:1 Sessions</span>
          </div>
          <div className="flex items-center gap-2.5 text-foreground">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-4" />
            </div>
            <span>Assigned Senior Mentor</span>
          </div>
          <div className="flex items-center gap-2.5 text-foreground">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CheckCircle2 className="size-4" />
            </div>
            <span>Personal Progress Tracker</span>
          </div>
        </div>
      </div>

      {/* Curriculum Table matching user's image */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Pro Curriculum</h3>
            <p className="text-xs text-muted-foreground">
              A structured 12-week roadmap executed 1-on-1 with senior specialists and mentors.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[100px] font-semibold">Week</TableHead>
                <TableHead className="font-semibold">Session</TableHead>
                <TableHead className="font-semibold">Format</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PRO_CURRICULUM_DATA.map((item) => (
                <TableRow key={item.week} className="hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">
                    {item.week}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {item.session}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.format}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
