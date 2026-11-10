"use client";

import Link from "next/link";
import {
  ArrowRight,
  Play,
  Users,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "./hero-background";
import { HeroDashboardPreview } from "./hero-dashboard-preview";
import {
  heroContainerVariants,
  headlineLineVariants,
  swooshVariants,
  fadeUpVariants,
  featureItemVariants,
} from "./hero-animations";
import { useAuthStore } from "@/stores/auth-store";
import { useMounted } from "@/hooks/use-mounted";
import { roleHome } from "@/hooks/use-require-auth";

export function HeroSection() {
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);
  const loggedIn = mounted && !!user;
  const shouldReduceMotion = useReducedMotion();

  const featurePills = [
    {
      icon: Users,
      label: "Cohort-based learning",
    },
    {
      icon: ShieldCheck,
      label: "Evidence & feedback",
    },
    {
      icon: TrendingUp,
      label: "Mentor guidance",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background pt-0 pb-6 sm:pt-2 sm:pb-8 lg:pt-3 lg:pb-10">
      {/* Dynamic Background with Ambient Gradients & Orbital Lines */}
      <HeroBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT SIDE: Hero Typography, CTAs & Features */}
          <motion.div
            variants={shouldReduceMotion ? undefined : heroContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left xl:col-span-6 z-10 pt-1 lg:pt-2"
          >
            {/* Large Staggered Headline */}
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl xl:text-[4.2rem] xl:leading-[1.06]">
              <motion.span variants={headlineLineVariants} className="block">
                Learn in cohorts.
              </motion.span>
              <motion.span
                variants={headlineLineVariants}
                className="block mt-1 sm:mt-1.5"
              >
                Prove it with{" "}
                <span className="relative inline-block text-primary">
                  evidence.
                  {/* Stylized Underline Swoosh */}
                  <svg
                    className="absolute -bottom-2.5 left-0 w-full overflow-visible text-primary pointer-events-none"
                    viewBox="0 0 250 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      d="M 4 14 C 60 4, 180 3, 246 11 C 180 18, 90 17, 18 15"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      variants={swooshVariants}
                    />
                  </svg>
                </span>
              </motion.span>
            </h1>

            {/* Supporting Description */}
            <motion.p
              variants={fadeUpVariants}
              className="mt-3.5 sm:mt-4 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed text-balance"
            >
              Join a cohort, work through real lessons and activities, submit
              evidence of your learning, and get direct feedback from mentors —
              all tracked on one roadmap.
            </motion.p>

            {/* Call-to-Action Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-5 sm:mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row lg:justify-start"
            >
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                {loggedIn ? (
                  <Button
                    size="xl"
                    className="w-full sm:w-auto bg-primary text-white shadow-lg shadow-blue-500/25 hover:bg-primary/90 transition-all font-semibold rounded-xl"
                    render={<Link href={roleHome(user!.role)} />}
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="size-4.5" />
                  </Button>
                ) : (
                  <Button
                    size="xl"
                    className="w-full sm:w-auto bg-primary text-white shadow-lg shadow-blue-500/25 hover:bg-primary/90 transition-all font-semibold rounded-xl"
                    render={<Link href="/login" />}
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="size-4.5" />
                  </Button>
                )}
              </motion.div>

              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto border-border/80 bg-white/90 text-foreground hover:bg-slate-50/90 shadow-xs font-semibold rounded-xl"
                  render={<Link href="#roadmap" />}
                >
                  <Play className="size-4 fill-primary text-primary" />
                  <span>See how it works</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Three Feature Highlights with Icons */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-7 sm:mt-8 pt-5 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 w-full max-w-xl"
            >
              {featurePills.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.label}
                    variants={featureItemVariants}
                    whileHover={shouldReduceMotion ? {} : { y: -3 }}
                    className="group flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5 transition-transform duration-200"
                  >
                    <div className="flex size-8.5 items-center justify-center rounded-xl bg-blue-50 text-primary transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-800">
                      {feature.label}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: Floating Interactive 3D Dashboard Preview */}
          <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center mt-2 lg:mt-0">
            <HeroDashboardPreview />
          </div>
        </div>

        {/* Scroll Mouse Indicator at Bottom Center */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center">
          <Link
            href="#roadmap"
            className="group flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors"
            aria-label="Scroll to curriculum roadmap"
          >
            <div className="flex h-7.5 w-4 items-start justify-center rounded-full border-2 border-slate-300 p-0.5 group-hover:border-primary transition-colors">
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, 5, 0],
                      }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="size-1 rounded-full bg-slate-400 group-hover:bg-primary transition-colors"
              />
            </div>
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      y: [0, 2.5, 0],
                    }
              }
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center -space-y-1 text-slate-400 group-hover:text-primary transition-colors"
            >
              <ChevronDown className="size-3" />
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
