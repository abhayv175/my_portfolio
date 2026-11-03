"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-50 pointer-events-none transform-gpu overflow-hidden select-none"
    >
      {/* Light Mode Background & Gradient Layer (Base) */}
      <div className="absolute inset-0 bg-slate-50 transform-gpu overflow-hidden">
        <div className="absolute inset-0 pointer-events-none animate-glow-in">
          {/* Top-Right Violet / Purple Glow (Vibrant Light Mode) */}
          <div className="absolute top-[-4rem] sm:top-[-6rem] right-[-8rem] sm:right-[1rem] opacity-90 pointer-events-none">
            <motion.div
              className="pointer-events-none h-[28rem] w-[28rem] sm:h-[51.25rem] sm:w-[68.75rem] rounded-full bg-[#B85CFF] blur-[6rem] sm:blur-[10rem] md:blur-[11rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.06, 0.98, 1.04, 1],
                opacity: [0.82, 1.0, 0.86, 0.98, 0.82],
                x: ["0%", "-3%", "2%", "-2%", "0%"],
                y: ["0%", "-2%", "3%", "-1%", "0%"],
              }}
              transition={{
                duration: 4.2,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Top-Left Warm Golden Amber / Orange Glow (Vibrant Light Mode) */}
          <div className="absolute top-[4rem] sm:top-[10rem] left-[-12rem] sm:left-[-10rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] opacity-85 pointer-events-none">
            <motion.div
              className="pointer-events-none h-[28rem] w-[28rem] sm:h-[31.25rem] sm:w-[68.75rem] rounded-full bg-[#FF7700] blur-[6rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.07, 0.97, 1.05, 1],
                opacity: [0.80, 1.0, 0.84, 0.97, 0.80],
                x: ["0%", "3%", "-2%", "2%", "0%"],
                y: ["0%", "2%", "-3%", "1%", "0%"],
              }}
              transition={{
                duration: 4.8,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
        </div>
      </div>

      {/* Dark Mode Background & Gradient Layer (Smooth GPU Opacity Cross-Fade) */}
      <div
        className="absolute inset-0 bg-[#09090b] transform-gpu overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out will-change-[opacity]"
        style={{ willChange: "opacity" }}
      >
        <div className="absolute inset-0 pointer-events-none animate-glow-in">
          {/* Top-Right Soft Purple Glow (Dark Mode) */}
          <div className="absolute top-[-4rem] sm:top-[-6rem] right-[-8rem] sm:right-[1rem] opacity-100 pointer-events-none">
            <motion.div
              className="pointer-events-none h-[28rem] w-[28rem] sm:h-[51.25rem] sm:w-[68.75rem] rounded-full bg-[#CF9FFF] blur-[6rem] sm:blur-[10rem] md:blur-[11rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.06, 0.98, 1.04, 1],
                opacity: [0.82, 1.0, 0.86, 0.98, 0.82],
                x: ["0%", "-3%", "2%", "-2%", "0%"],
                y: ["0%", "-2%", "3%", "-1%", "0%"],
              }}
              transition={{
                duration: 4.2,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Top-Left Warm Golden Amber Glow (Dark Mode) */}
          <div className="absolute top-[4rem] sm:top-[10rem] left-[-12rem] sm:left-[-10rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] opacity-100 pointer-events-none">
            <motion.div
              className="pointer-events-none h-[28rem] w-[28rem] sm:h-[31.25rem] sm:w-[68.75rem] rounded-full bg-[#F08000] blur-[6rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.07, 0.97, 1.05, 1],
                opacity: [0.80, 1.0, 0.84, 0.97, 0.80],
                x: ["0%", "3%", "-2%", "2%", "0%"],
                y: ["0%", "2%", "-3%", "1%", "0%"],
              }}
              transition={{
                duration: 4.8,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
