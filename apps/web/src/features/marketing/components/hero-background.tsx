"use client";

import { motion, useReducedMotion } from "motion/react";

export function HeroBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10"
    >
      {/* 1. Large radiant ambient glow behind the dashboard / right hero */}
      <div className="absolute -top-24 right-[-10%] sm:right-[-5%] lg:right-[0%] h-[600px] w-[600px] sm:h-[750px] sm:w-[750px] rounded-full bg-gradient-to-br from-blue-400/20 via-primary/10 to-transparent blur-[110px]" />

      {/* 2. Soft subtle ambient glow on the left / center */}
      <div className="absolute top-1/4 -left-20 h-[450px] w-[450px] rounded-full bg-blue-300/15 blur-[90px]" />

      {/* 3. Subtle bottom wave glow for natural depth */}
      <div className="absolute -bottom-24 right-1/4 h-[400px] w-[600px] rounded-full bg-blue-400/10 blur-[100px]" />

      {/* 4. Moving gradient orbs (subtle, GPU-accelerated translate only) */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-[80px]"
            animate={{
              x: [-15, 20, -15],
              y: [-10, 15, -10],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 right-[15%] h-64 w-64 rounded-full bg-indigo-400/10 blur-[75px]"
            animate={{
              x: [15, -15, 15],
              y: [15, -10, 15],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* 5. Precise orbital vector lines matching the reference aesthetic */}
      <svg
        className="absolute inset-0 h-full w-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="orbital-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
            <stop offset="45%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="orbital-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#93c5fd" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer orbital ellipse looping around the dashboard container */}
        <motion.path
          d="M 680 520 C 660 620, 800 680, 1020 660 C 1260 635, 1380 490, 1340 340 C 1300 190, 1100 130, 880 180 C 720 215, 680 320, 720 400"
          stroke="url(#orbital-gradient-1)"
          strokeWidth="1.5"
          strokeDasharray="6 8"
          initial={shouldReduceMotion ? { opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 0.6 } : { pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />

        {/* Dynamic trajectory curve with small directional arrow */}
        <motion.path
          d="M 850 250 C 920 220, 1000 215, 1070 230"
          stroke="url(#orbital-gradient-2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { opacity: 0.5 } : { pathLength: 0 }}
          animate={shouldReduceMotion ? { opacity: 0.7 } : { pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
        />
        {/* Trajectory arrow */}
        <motion.path
          d="M 1060 224 L 1073 231 L 1062 238"
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1.5, duration: 0.4 }}
        />

        {/* Lower sweeping loop under the floating card */}
        <motion.path
          d="M 640 500 C 600 640, 760 700, 960 690 C 1120 680, 1260 610, 1330 520"
          stroke="url(#orbital-gradient-1)"
          strokeWidth="1.25"
          initial={shouldReduceMotion ? { opacity: 0.5 } : { pathLength: 0 }}
          animate={shouldReduceMotion ? { opacity: 0.65 } : { pathLength: 1 }}
          transition={{ duration: 2.4, delay: 0.3, ease: "easeOut" }}
        />

        {/* Faint micro decorative orbit point */}
        <circle cx="890" cy="180" r="3" fill="#2563eb" opacity="0.6" />
      </svg>
    </div>
  );
}
