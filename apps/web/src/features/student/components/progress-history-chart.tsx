import type { ProgressHistoryPoint } from "@/types/progress";

export function ProgressHistoryChart({ data }: { data: ProgressHistoryPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((point) => (
        <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end overflow-hidden rounded-md bg-muted">
            <div
              className="w-full rounded-md bg-primary transition-all"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">{point.date}</span>
        </div>
      ))}
    </div>
  );
}
