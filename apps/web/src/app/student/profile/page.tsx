"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeading } from "@/components/common/page-heading";
import { FormField } from "@/components/common/form-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usersService } from "@/services/users.service";
import { learningService } from "@/services/learning.service";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api-client";

const schema = z.object({ email: z.string().min(1, "Email is required").email("Enter a valid email") });
type Values = z.infer<typeof schema>;

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: usersService.getMe });
  const { data: cohorts, isLoading: cohortsLoading } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ email: user.email });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (values: Values) => usersService.updateMe(values),
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.setQueryData(["me"], updated);
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't update profile"),
  });

  return (
    <>
      <PageHeading title="Profile" />

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="flex max-w-xl flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Courses enrolled</p>
                {cohortsLoading ? (
                  <Skeleton className="h-8 w-10" />
                ) : (
                  <p className="font-heading text-2xl font-medium text-foreground">{cohorts?.length ?? 0}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="font-heading text-2xl font-medium text-foreground">0%</p>
                <p className="text-[11px] text-muted-foreground">Not tracked yet</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback>{user?.email.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{user?.email}</CardTitle>
                  <CardDescription>
                    {user?.role} · Joined {user && formatDate(user.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
                <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                  <Input id="email" type="email" {...register("email")} />
                </FormField>
                <Button type="submit" className="w-fit" disabled={!isDirty || mutation.isPending}>
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
