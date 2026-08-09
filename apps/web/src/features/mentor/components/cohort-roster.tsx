"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/common/form-field";
import { EmptyState } from "@/components/common/empty-state";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { rosterService } from "@/services/learning.service";
import { fullName } from "@/lib/format";
import { toast } from "sonner";

export function CohortRoster({ cohortId }: { cohortId: string }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState("");

  const { data: roster, isLoading } = useQuery({
    queryKey: ["cohort-roster", cohortId],
    queryFn: () => rosterService.list(cohortId),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["cohort-roster", cohortId] });
    queryClient.invalidateQueries({ queryKey: ["cohort-overview", cohortId] });
  };

  const enroll = useMutation({
    mutationFn: () => rosterService.enroll(cohortId, email),
    onSuccess: () => {
      refresh();
      toast.success(`${email} added to this cohort`);
      setEmail("");
      setAdding(false);
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't add that student"),
  });

  const withdraw = useMutation({
    mutationFn: (studentId: string) => rosterService.withdraw(cohortId, studentId),
    onSuccess: () => {
      refresh();
      toast.success("Student removed from this cohort");
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't remove that student"),
  });

  const handleWithdraw = (studentId: string, studentEmail: string) => {
    if (confirm(`Remove ${studentEmail} from this cohort? Their progress is kept if you add them back.`)) {
      withdraw.mutate(studentId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  const active = roster?.filter((r) => r.status === "active") ?? [];

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {active.length} {active.length === 1 ? "student" : "students"} in this cohort
        </p>
        <Button onClick={() => setAdding(true)}>
          <UserPlus className="size-4" />
          Add a student
        </Button>
      </div>

      {roster?.length === 0 && (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Add a student by the email they signed up with."
        />
      )}

      <div className="flex flex-col gap-3">
        {roster?.map((entry) => {
          const withdrawn = entry.status !== "active";
          return (
            <Card key={entry.studentId} className={withdrawn ? "opacity-60" : undefined}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{fullName(entry)}</p>
                    <span className="truncate text-xs text-muted-foreground">{entry.email}</span>
                    {withdrawn && (
                      <Badge variant="outline" className="text-[10px]">
                        Removed
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={entry.percent} className="max-w-xs flex-1" />
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {entry.completedLessons}/{entry.totalLessons} lessons · {entry.percent}%
                    </span>
                  </div>
                </div>

                {!withdrawn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleWithdraw(entry.studentId, entry.email)}
                    className="shrink-0 text-destructive hover:bg-destructive/10"
                  >
                    <UserMinus className="size-3.5" />
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a student</DialogTitle>
          </DialogHeader>
          <FormField label="Their sign-up email" htmlFor="studentEmail">
            <Input
              id="studentEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
            />
          </FormField>
          <DialogFooter>
            <DialogClose nativeButton render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button onClick={() => enroll.mutate()} disabled={enroll.isPending || !email.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
