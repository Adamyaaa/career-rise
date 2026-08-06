"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/common/form-field";
import { mockDelay } from "@/lib/mock-delay";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type Values = z.infer<typeof schema>;

// MOCK — password reset isn't in the approved API contract yet (only
// register/login/refresh/logout). UI is built to the same shape a real
// POST /auth/forgot-password would need, so wiring it up later is a one-line swap.
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    await mockDelay(null, 600);
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">Check your email</p>
          <p className="text-sm text-muted-foreground">
            If an account exists for <span className="text-foreground">{sentTo}</span>, we&apos;ve sent
            a link to reset your password.
          </p>
          <Link href="/login" className="mt-2 text-sm font-medium text-foreground hover:underline">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>We&apos;ll email you a link to reset it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          </FormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
