"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/common/form-field";
import { mockDelay } from "@/lib/mock-delay";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  message: z.string().min(10, "Tell us a bit more (at least 10 characters)"),
});

type Values = z.infer<typeof schema>;

// MOCK — no /contact endpoint in the approved API contract; this is a marketing-site
// lead form, intentionally outside the Career Rise API surface.
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit() {
    await mockDelay(null, 700);
    setSent(true);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-5" />
          </span>
          <p className="text-sm font-medium text-foreground">Message sent</p>
          <p className="text-sm text-muted-foreground">
            Thanks for reaching out — we typically reply within one business day.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-2">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" placeholder="Your name" {...register("name")} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
          </FormField>
          <FormField label="Message" htmlFor="message" error={errors.message?.message}>
            <Textarea id="message" rows={5} placeholder="How can we help?" {...register("message")} />
          </FormField>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Send message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
