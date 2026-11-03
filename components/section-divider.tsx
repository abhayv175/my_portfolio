"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SectionDivider() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
      className="mt-8 sm:mt-10 mb-10 sm:mb-12 h-[260px] sm:h-[606px] w-1 sm:w-1.5 flex justify-center items-center pointer-events-none select-none relative z-10"
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full rounded-full bg-slate-400/50 dark:bg-white/35 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.12)] dark:shadow-[0_0_15px_rgba(255,255,255,0.4)] border border-black/5 dark:border-white/20 transform-gpu will-change-transform origin-top"
        style={{ transformOrigin: "top center" }}
        animate={{
          opacity: [0.3, 0.9, 0.3],
          scaleY: [0.92, 1.04, 0.92],
          y: [0, 8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
