import type { Variants, Transition } from "motion/react";

/**
 * Standard spring and easing curves for premium SaaS motion design
 */
export const transitions = {
  springSmooth: {
    type: "spring",
    stiffness: 100,
    damping: 18,
    mass: 1,
  } as Transition,
  springSnappy: {
    type: "spring",
    stiffness: 160,
    damping: 20,
    mass: 0.8,
  } as Transition,
  springBouncy: {
    type: "spring",
    stiffness: 220,
    damping: 18,
  } as Transition,
  easePremium: {
    duration: 0.7,
    ease: [0.16, 1, 0.3, 1], // Custom smooth ease-out curve
  } as Transition,
  easeSlow: {
    duration: 1.1,
    ease: [0.16, 1, 0.3, 1],
  } as Transition,
};

/**
 * Orchestrator variants for staggered entrance
 */
export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

/**
 * Badge animation: gentle upward slide + fade in
 */
export const badgeVariants: Variants = {
  hidden: { opacity: 0, y: -12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 18,
    },
  },
};

/**
 * Headline animation: line by line staggered entrance
 */
export const headlineLineVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: transitions.easePremium,
  },
};

/**
 * Underline swoosh draw animation
 */
export const swooshVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: 0.45, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      opacity: { delay: 0.45, duration: 0.2 },
    },
  },
};

/**
 * Description and CTA fade up
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.easePremium,
  },
};

/**
 * Feature highlight item
 */
export const featureItemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.springSmooth,
  },
};

/**
 * Dashboard 3D container entrance
 */
export const dashboardVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
    y: 20,
    rotateY: 12,
    rotateX: 8,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotateY: -6,
    rotateX: 4,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 20,
      mass: 1.2,
      delay: 0.2,
    },
  },
};

/**
 * Floating notification card over dashboard
 */
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    x: 10,
    scale: 0.88,
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 18,
      delay: 0.75, // Pop in shortly after dashboard settles
    },
  },
};

/**
 * Reduced motion fallback variants
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};
