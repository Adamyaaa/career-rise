import { Badge } from "@/components/ui/badge";

const styles: Record<string, string> = {
  // evidence / assignment
  reviewed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  submitted: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  under_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  not_started: "bg-muted text-muted-foreground",
  grading_failed: "bg-destructive/10 text-destructive",
  // attendance
  present: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  late: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  excused: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  absent: "bg-destructive/10 text-destructive",
  // cohort / user
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  upcoming: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-muted text-muted-foreground",
  invited: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended: "bg-destructive/10 text-destructive",
  withdrawn: "bg-destructive/10 text-destructive",
};

const labels: Record<string, string> = {
  under_review: "Under review",
  in_progress: "In progress",
  not_started: "Not started",
  grading_failed: "Grading failed",
};

export function StatusBadge({ status }: { status: string }) {
  const label = labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className={`border-transparent ${styles[status] ?? "bg-muted text-muted-foreground"}`}>
      {label}
    </Badge>
  );
}
