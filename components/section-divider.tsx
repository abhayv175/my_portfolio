"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export default function SectionDivider() {
  const dividerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(dividerRef, { amount: 0.05 });

  return (
    <motion.div
      ref={dividerRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      className="mt-8 sm:mt-10 mb-10 sm:mb-12 h-[260px] sm:h-[606px] w-1 sm:w-1.5 flex justify-center items-center pointer-events-none select-none relative z-10"
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full rounded-full bg-gradient-to-b from-indigo-500/40 via-sky-500/30 to-transparent dark:from-indigo-400/50 dark:via-sky-400/40 dark:to-transparent backdrop-blur-md shadow-[0_0_12px_rgba(99,102,241,0.25)] border border-indigo-500/20 dark:border-indigo-400/25 transform-gpu will-change-transform origin-top"
        style={{ transformOrigin: "top center" }}
        animate={
          shouldReduceMotion || !isInView
            ? { opacity: 0.7, scaleY: 1, y: 0 }
            : {
                opacity: [0.4, 1.0, 0.4],
                scaleY: [0.94, 1.05, 0.94],
                y: [0, 8, 0],
              }
        }
        transition={{
          duration: 2.2,
          repeat: shouldReduceMotion || !isInView ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
