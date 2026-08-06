"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/common/reveal";
import { ProductPreview } from "./product-preview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--color-muted),transparent)]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-20 pb-20 sm:px-6 lg:px-8 lg:pt-28 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary">Now open — Agentic AI cohort</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Learn in cohorts.
            <br />
            Prove it with evidence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-balance"
          >
            Join a cohort, work through real lessons and activities, submit
            evidence of your learning, and get direct feedback from mentors —
            all tracked on one roadmap.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" render={<Link href="/register" />}>
              Get started <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="#how-it-works" />}>
              See how it works
            </Button>
          </motion.div>
        </div>

        <Reveal delay={0.1} className="mt-16 lg:mt-20">
          <ProductPreview />
        </Reveal>
      </div>
    </section>
  );
}
