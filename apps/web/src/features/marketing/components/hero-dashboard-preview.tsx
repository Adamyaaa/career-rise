"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Compass,
  FileCheck2,
  GraduationCap,
  Check,
  Calendar,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  dashboardVariants,
  notificationVariants,
} from "./hero-animations";

export function HeroDashboardPreview() {
  const shouldReduceMotion = useReducedMotion();
  const [progressFilled, setProgressFilled] = useState(false);

  // Apple Design Principle: Physical Mouse Parallax Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 120, mass: 0.8 };
  const tiltX = useSpring(
    useTransform(mouseY, [-300, 300], [8, 0]),
    springConfig
  );
  const tiltY = useSpring(
    useTransform(mouseX, [-300, 300], [-10, -2]),
    springConfig
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressFilled(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const circleSize = 68;
  const strokeWidth = 6.5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - 0.6);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "My Cohorts", icon: Users, active: false },
    { name: "Roadmap", icon: Compass, active: false },
    { name: "Evidence", icon: FileCheck2, active: false },
    { name: "Mentorship", icon: GraduationCap, active: false },
  ];

  const checklistItems = [
    { label: "Complete lesson", completed: true },
    { label: "Build a mini project", completed: true },
    { label: "Submit evidence", completed: false },
    { label: "Get mentor feedback", completed: false },
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto w-full max-w-[620px] lg:max-w-[660px] select-none [perspective:1400px] py-2"
    >
      {/* 3D Tilted Dashboard Window with Cursor Parallax */}
      <motion.div
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
        style={{
          transformStyle: "preserve-3d",
          rotateX: shouldReduceMotion ? 4 : tiltX,
          rotateY: shouldReduceMotion ? -6 : tiltY,
        }}
        className="relative"
      >
        {/* Subtle continuous floating motion container */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [-3.5, 3.5, -3.5],
                  rotateZ: [-0.4, 0.4, -0.4],
                }
          }
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative rounded-2xl sm:rounded-3xl border border-white/80 bg-white/95 p-1 sm:p-1.5 shadow-[0_25px_60px_-15px_rgba(37,99,235,0.18),0_12px_24px_-8px_rgba(15,23,42,0.08),0_0_0_1px_rgba(226,232,240,0.8)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_32px_75px_-12px_rgba(37,99,235,0.25),0_18px_36px_-8px_rgba(15,23,42,0.12)]"
        >
          {/* Browser Window Header */}
          <div className="flex items-center justify-between border-b border-slate-100/90 px-4 py-2.5 sm:py-3 bg-slate-50/60 rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="size-2.5 sm:size-3 rounded-full bg-[#ff5f56] shadow-inner" />
              <span className="size-2.5 sm:size-3 rounded-full bg-[#ffbd2e] shadow-inner" />
              <span className="size-2.5 sm:size-3 rounded-full bg-[#27c93f] shadow-inner" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
              <span>careerrise.app</span>
            </div>
            <div className="w-10" />
          </div>

          {/* Dashboard Body Grid: Sidebar + Main Content */}
          <div className="grid grid-cols-12 min-h-[340px] sm:min-h-[380px] bg-white rounded-b-xl sm:rounded-b-2xl overflow-hidden">
            {/* Mini Sidebar */}
            <div className="hidden sm:flex col-span-3.5 sm:col-span-3 flex-col border-r border-slate-100/90 bg-slate-50/40 p-3 sm:p-3.5">
              {/* Mini Brand Logo */}
              <div className="flex items-center gap-2 px-1.5 py-1 mb-4">
                <Image
                  src="/logo-icon.png"
                  alt="CareerRise"
                  width={24}
                  height={24}
                  className="size-5 sm:size-6 object-contain"
                />
                <span className="font-heading font-semibold text-xs sm:text-sm text-slate-900 tracking-tight">
                  Career<span className="text-primary">Rise</span>
                </span>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                        item.active
                          ? "bg-blue-50/90 text-primary shadow-xs font-semibold"
                          : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-800"
                      }`}
                    >
                      <Icon
                        className={`size-3.5 transition-transform duration-150 group-hover:scale-110 ${
                          item.active ? "text-primary" : "text-slate-400"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </nav>

              {/* Mini user footnote */}
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 px-1">
                <div className="size-6 rounded-full bg-blue-100 text-primary font-semibold text-[10px] flex items-center justify-center">
                  ST
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-medium text-slate-800 truncate">
                    Sarah Tan
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">Student</p>
                </div>
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="col-span-12 sm:col-span-9 p-4 sm:p-5 flex flex-col justify-between gap-4">
              {/* Top Banner / Cohort Title */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-semibold text-slate-900">
                      Agentic AI · Cohort 3
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      Week 2 · Build & Submit
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
                    On track
                  </span>
                </div>

                {/* Animated Horizontal Progress Bar */}
                <div className="mt-3.5 flex items-center gap-3">
                  <div className="relative h-2 w-full flex-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: progressFilled ? "60%" : "0%" }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 1.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-primary">60%</span>
                </div>
              </div>

              {/* Two Column Section: Checklist on left, Progress & Session on right */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch">
                {/* Task Checklist */}
                <div className="sm:col-span-7 flex flex-col justify-center gap-2 rounded-xl bg-slate-50/60 p-3 sm:p-3.5 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-0.5">
                    Weekly Tasks
                  </p>
                  <div className="flex flex-col gap-2">
                    {checklistItems.map((task) => (
                      <div
                        key={task.label}
                        className="group flex items-center gap-2.5 text-xs text-slate-700 transition-colors hover:text-slate-900"
                      >
                        <div
                          className={`flex size-4 shrink-0 items-center justify-center rounded transition-transform duration-150 group-hover:scale-105 ${
                            task.completed
                              ? "bg-primary text-white shadow-xs"
                              : "border border-slate-300 bg-white"
                          }`}
                        >
                          {task.completed && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`truncate ${
                            task.completed
                              ? "text-slate-800 font-medium"
                              : "text-slate-500"
                          }`}
                        >
                          {task.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Circular Progress & Next Session */}
                <div className="sm:col-span-5 flex flex-col justify-between gap-2.5">
                  {/* Your Progress circular card */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 sm:p-3 shadow-xs">
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Your Progress
                      </p>
                      <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                        60%
                      </p>
                    </div>

                    {/* Circular Progress Gauge */}
                    <div
                      className="relative flex shrink-0 items-center justify-center"
                      style={{ width: circleSize, height: circleSize }}
                    >
                      <svg
                        width={circleSize}
                        height={circleSize}
                        viewBox={`0 0 ${circleSize} ${circleSize}`}
                        className="-rotate-90 transform"
                      >
                        <circle
                          cx={circleSize / 2}
                          cy={circleSize / 2}
                          r={radius}
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth={strokeWidth}
                        />
                        <motion.circle
                          cx={circleSize / 2}
                          cy={circleSize / 2}
                          r={radius}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={strokeWidth}
                          strokeDasharray={circumference}
                          strokeLinecap="round"
                          className="text-primary"
                          initial={{ strokeDashoffset: circumference }}
                          animate={{
                            strokeDashoffset: progressFilled
                              ? targetOffset
                              : circumference,
                          }}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 1.4,
                            ease: [0.16, 1, 0.3, 1],
                            delay: 0.1,
                          }}
                        />
                      </svg>
                      <span className="absolute text-[11px] font-bold text-slate-800">
                        60%
                      </span>
                    </div>
                  </div>

                  {/* Next Session card */}
                  <div className="rounded-xl border border-blue-100/80 bg-blue-50/50 p-2.5 sm:p-3">
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                      Next Session
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-primary shrink-0">
                        <Calendar className="size-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          Mentor Review
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Sat, 11:00 AM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Layered Notification Card (Top Right) */}
      <motion.div
        variants={notificationVariants}
        initial="hidden"
        animate="visible"
        className="absolute -top-6 -right-2 sm:-top-8 sm:-right-4 z-20 pointer-events-auto"
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [-2, 2, -2],
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="relative flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_16px_36px_-6px_rgba(37,99,235,0.18),0_4px_12px_rgba(15,23,42,0.05)] backdrop-blur-md transition-transform duration-200 hover:scale-[1.02]"
        >
          {/* Notification blue indicator dot */}
          <span className="absolute top-2 right-2 flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>

          {/* Graduation Cap circular icon */}
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-xs shrink-0">
            <GraduationCap className="size-4 sm:size-5" />
          </div>

          {/* Notification Text */}
          <div className="pr-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
              New feedback from mentor
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              Your submission has been reviewed!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
