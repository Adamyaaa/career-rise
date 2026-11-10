"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";
import { useAuthStore } from "@/stores/auth-store";
import { useMounted } from "@/hooks/use-mounted";
import { roleHome } from "@/hooks/use-require-auth";

export function CtaSection() {
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);
  const loggedIn = mounted && !!user;
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-2xl border border-border/60 bg-card px-6 py-16 text-center shadow-xs">
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Ready to start your cohort?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-balance">
            Stop collecting courses and start building a portfolio you can actually show to employers. Do it with a mentor reviewing your work, not just a syllabus.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            >
              {loggedIn ? (
                <Button size="lg" render={<Link href={roleHome(user!.role)} />}>
                  Dashboard <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button size="lg" render={<Link href="/register" />}>
                  Get started <ArrowRight className="size-4" />
                </Button>
              )}
            </motion.div>
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            >
              <Button size="lg" variant="outline" render={<Link href="/contact" />}>
                Talk to us
              </Button>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
