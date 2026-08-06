import { CheckCircle2, FileCheck2, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// A stylized, illustrative mockup of the student dashboard — not a real screenshot or
// real data. Gives the hero section a concrete visual without depending on product UI
// that's still being built.
export function ProductPreview() {
  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-foreground/5">
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/40" />
        <span className="size-2.5 rounded-full bg-amber-400/50" />
        <span className="size-2.5 rounded-full bg-emerald-400/50" />
        <span className="ml-3 text-xs text-muted-foreground">
          careerrise.app/dashboard
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,180px)_1fr] gap-0">
        <div className="hidden flex-col gap-1 border-r border-border/60 p-4 sm:flex">
          {["Dashboard", "Courses", "Assignments", "Progress", "Roadmap"].map(
            (item, i) => (
              <div
                key={item}
                className={
                  "rounded-md px-2.5 py-2 text-xs font-medium " +
                  (i === 0
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground")
                }
              >
                {item}
              </div>
            ),
          )}
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Agentic AI · Cohort 3
              </p>
              <p className="text-xs text-muted-foreground">Week 4 of 12</p>
            </div>
            <Badge variant="secondary">On track</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="mt-1 text-lg font-semibold text-foreground">68%</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="mt-1 text-lg font-semibold text-foreground">92%</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[92%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <p className="text-xs text-muted-foreground">Evidence</p>
              <p className="mt-1 text-lg font-semibold text-foreground">9/12</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[75%] rounded-full bg-primary" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-3">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="size-4 shrink-0 text-primary" />
              <p className="text-xs text-foreground">
                Evidence submitted for{" "}
                <span className="font-medium">Building your first agent</span>
              </p>
              <CheckCircle2 className="ml-auto size-4 shrink-0 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2.5">
              <MessageSquareText className="size-4 shrink-0 text-primary" />
              <p className="text-xs text-foreground">
                Mentor feedback ready on{" "}
                <span className="font-medium">Tool use & memory</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
