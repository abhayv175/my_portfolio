"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/context/theme-context";

export default function AmbientGlow() {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showLightBlobs = mounted && theme === "light";
  const showDarkBlobs = mounted && theme === "dark";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 h-[100lvh] -z-10 w-full pointer-events-none transform-gpu overflow-hidden select-none"
    >
      {/* =========================================================================
          LIGHT MODE BACKGROUND & DYNAMIC MESH GRADIENT
         ========================================================================= */}
      <div className="dark:hidden absolute inset-0 w-full h-full bg-gradient-to-b from-[#f5f2ff] via-[#edf4ff] to-[#faf5ff] transform-gpu overflow-hidden">
        {/* Top radial ambient daylight sheen with richer violet-indigo warmth */}
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(99,102,241,0.32),rgba(255,255,255,0))] pointer-events-none" />

        {showLightBlobs && (
          <div className="absolute inset-0 w-full h-full pointer-events-none animate-glow-in">
            {/* Node 1: Top-Right Violet / Rose / Indigo */}
            <div className="absolute top-[-8rem] sm:top-[-12rem] right-[-6rem] sm:right-[2rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[22rem] w-[22rem] sm:h-[52rem] sm:w-[56rem] rounded-full bg-gradient-to-tr from-[#6366f1] via-[#ec4899] to-[#3b82f6] blur-2xl sm:blur-[7.5rem] md:blur-[9rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.56 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.15, 0.94, 1.12, 1],
                        opacity: [0.5, 0.66, 0.54, 0.64, 0.5],
                        x: ["0%", "-12%", "8%", "-6%", "0%"],
                        y: ["0%", "10%", "-8%", "6%", "0%"],
                      }
                }
                transition={{
                  duration: 11,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Node 2: Top-Left Cyan / Sky / Emerald */}
            <div className="absolute top-[0rem] sm:top-[2rem] left-[-8rem] sm:left-[-6rem] md:left-[-10rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[20rem] w-[20rem] sm:h-[48rem] sm:w-[52rem] rounded-full bg-gradient-to-br from-[#06b6d4] via-[#0ea5e9] to-[#10b981] blur-2xl sm:blur-[7.5rem] md:blur-[9rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.52 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.14, 0.92, 1.12, 1],
                        opacity: [0.46, 0.64, 0.5, 0.6, 0.46],
                        x: ["0%", "12%", "-10%", "6%", "0%"],
                        y: ["0%", "-8%", "12%", "-5%", "0%"],
                      }
                }
                transition={{
                  duration: 12.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Node 3: Center-Hero Radiant Core */}
            <div className="absolute top-[-2rem] sm:top-[2rem] left-1/2 -translate-x-1/2 pointer-events-none">
              <motion.div
                className="pointer-events-none h-[20rem] w-[24rem] sm:h-[42rbransform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.42 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.16, 0.92, 1.12, 1],
                        opacity: [0.36, 0.54, 0.4, 0.5, 0.36],
                        x: ["0%", "-8%", "10%", "-5%", "0%"],
                        y: ["0%", "6%", "-8%", "5%", "0%"],
                      }
                }
                transition={{
                  duration: 14,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Node 4: Mid-Page Fuchsia / Coral / Amethyst */}
            <div className="hidden sm:block absolute top-[36%] sm:top-[34%] right-[-8rem] sm:right-[-6rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[26rem] w-[26rem] sm:h-[44rem] sm:w-[48rem] rounded-full bg-gradient-to-tl from-[#d946ef] via-[#f43f5e] to-[#f59e0b] blur-[6rem] sm:blur-[8rem] md:blur-[9.5rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.5 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.16, 0.93, 1.1, 1],
                        opacity: [0.44, 0.62, 0.48, 0.58, 0.44],
                        x: ["0%", "-10%", "8%", "-5%", "0%"],
                        y: ["0%", "12%", "-8%", "6%", "0%"],
                      }
                }
                transition={{
                  duration: 13,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Node 5: Lower-Left Sky / Teal / Indigo */}
            <div className="hidden sm:block absolute top-[62%] sm:top-[58%] left-[-8rem] sm:left-[-6rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[28rem] w-[28rem] sm:h-[46rem] sm:w-[50rem] rounded-full bg-gradient-to-tr from-[#0ea5e9] via-[#14b8a6] to-[#6366f1] blur-[6rem] sm:blur-[8rem] md:blur-[9.5rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.52 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.14, 0.94, 1.12, 1],
                        opacity: [0.46, 0.64, 0.5, 0.6, 0.46],
                        x: ["0%", "10%", "-8%", "6%", "0%"],
                        y: ["0%", "-10%", "8%", "-5%", "0%"],
                      }
                }
                transition={{
                  duration: 15,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>
          </div>
        )}

        {/* Delicate Tactile Dot-Matrix Texture (Light Mode) */}
        <div
          className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.8) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* =========================================================================
          DARK MODE BACKGROUND & DYNAMIC COSMIC MESH GRADIENT
         ========================================================================= */}
      <div className="hidden dark:block absolute inset-0 w-full h-full bg-gradient-to-b from-[#0f0c24] via-[#0a0818] to-[#06050e] transform-gpu overflow-hidden">
        {/* Top radial atmospheric midnight indigo sheen */}
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_100%_80%_at_50%_-15%,rgba(99,102,241,0.28),rgba(0,0,0,0))] pointer-events-none" />

        {showDarkBlobs && (
          <div className="absolute inset-0 w-full h-full pointer-events-none animate-glow-in">
            {/* Node 1: Top-Right Deep Cosmic Indigo/Violet Aura */}
            <div className="absolute top-[-6rem] sm:top-[-10rem] right-[-6rem] sm:right-[3rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[22rem] w-[22rem] sm:h-[50rem] sm:w-[58rem] rounded-full bg-[#6366f1] blur-2xl sm:blur-[11rem] md:blur-[13rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.36 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.08, 0.96, 1.05, 1],
                        opacity: [0.32, 0.48, 0.36, 0.45, 0.32],
                        x: ["0%", "-4%", "3%", "-2%", "0%"],
                        y: ["0%", "-2%", "3%", "-1%", "0%"],
                      }
                }
                transition={{
                  duration: 7,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Node 2: Top-Left Crisp Ethereal Cyan/Sky Aura */}
            <div className="absolute top-[2rem] sm:top-[4rem] left-[-8rem] sm:left-[-6rem] md:left-[-12rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[20rem] w-[20rem] sm:h-[45rem] sm:w-[52rem] rounded-full bg-[#0ea5e9] blur-2xl sm:blur-[11rem] md:blur-[13rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.3 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.06, 0.95, 1.04, 1],
                        opacity: [0.26, 0.42, 0.3, 0.38, 0.26],
                        x: ["0%", "4%", "-3%", "2%", "0%"],
                        y: ["0%", "3%", "-2%", "2%", "0%"],
                      }
                }
                transition={{
                  duration: 8.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Node 3: Mid-Page Electric Violet/Amethyst Nebula */}
            <div className="hidden sm:block absolute top-[38%] sm:top-[35%] right-[-10rem] sm:right-[-8rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[24rem] w-[24rem] sm:h-[42rem] sm:w-[46rem] rounded-full bg-[#8b5cf6] blur-[8rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.26 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.07, 0.94, 1.03, 1],
                        opacity: [0.22, 0.38, 0.26, 0.35, 0.22],
                        x: ["0%", "-3%", "2%", "-1%", "0%"],
                        y: ["0%", "4%", "-3%", "1%", "0%"],
                      }
                }
                transition={{
                  duration: 11,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>

            {/* Node 4: Lower-Left Deep Ocean Azure Glow */}
            <div className="hidden sm:block absolute top-[65%] sm:top-[60%] left-[-10rem] sm:left-[-8rem] pointer-events-none">
              <motion.div
                className="pointer-events-none h-[26rem] w-[26rem] sm:h-[44rem] sm:w-[48rem] rounded-full bg-[#38bdf8] blur-[8rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
                style={{ transform: "translateZ(0)", opacity: 0.24 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.05, 0.97, 1.04, 1],
                        opacity: [0.2, 0.35, 0.24, 0.32, 0.2],
                        x: ["0%", "3%", "-2%", "1%", "0%"],
                        y: ["0%", "-3%", "2%", "-1%", "0%"],
                      }
                }
                transition={{
                  duration: 10,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </div>
          </div>
        )}

        {/* Delicate Tactile Dot-Matrix Texture (Dark Mode) */}
        <div
          className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>
    </div>
  );
}
