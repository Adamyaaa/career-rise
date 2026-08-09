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
import { formatDate, fullName } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import type { User } from "@/types/user";

function initialsFor(user: User) {
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("");
  return (initials || user.email.slice(0, 2)).toUpperCase();
}

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^$|^[+()\d\s-]{6,20}$/, "Enter a valid phone number"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type Values = z.infer<typeof schema>;

export default function StudentProfilePage() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: usersService.getMe });
  const { data: cohorts, isLoading: cohortsLoading } = useQuery({
    queryKey: ["my-cohorts"],
    queryFn: learningService.listMyCohorts,
  });
  const completedLessons = cohorts?.reduce((sum, c) => sum + (c.progress?.completedLessons ?? 0), 0) ?? 0;
  const totalLessons = cohorts?.reduce((sum, c) => sum + (c.progress?.totalLessons ?? 0), 0) ?? 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
      });
    }
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
          <div className="grid grid-cols-3 gap-4">
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
                <p className="text-xs text-muted-foreground">Lessons completed</p>
                {cohortsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="font-heading text-2xl font-medium text-foreground">
                    {completedLessons}/{totalLessons}
                  </p>
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
                  <AvatarFallback>{user && initialsFor(user)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{user && fullName(user)}</CardTitle>
                  <CardDescription>
                    {user?.email} · Joined {user && formatDate(user.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                    <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
                  </FormField>
                  <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                    <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
                  </FormField>
                </div>
                <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                  <Input id="email" type="email" {...register("email")} />
                </FormField>
                <FormField label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
                  <Input id="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...register("phone")} />
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
