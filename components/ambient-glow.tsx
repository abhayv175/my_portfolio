"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full min-h-[100dvh] pointer-events-none transform-gpu overflow-hidden select-none"
    >
      {/* =========================================================================
          LIGHT MODE BACKGROUND & DYNAMIC MESH GRADIENT
          (Rich pearlescent daylight atmosphere — vibrant, airy, never plain white)
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full min-h-[100dvh] bg-gradient-to-b from-[#f3f0ff] via-[#edf5ff] to-[#fbf7ff] transform-gpu overflow-hidden">
        {/* Top radial ambient daylight sheen */}
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(129,140,248,0.25),rgba(255,255,255,0))] pointer-events-none" />

        <div className="absolute inset-0 w-full h-full pointer-events-none animate-glow-in">
          {/* Node 1: Top-Right Soft Indigo/Lavender Aura */}
          <div className="absolute top-[-6rem] sm:top-[-10rem] right-[-6rem] sm:right-[3rem] pointer-events-none">
            <motion.div
              className="pointer-events-none h-[28rem] w-[28rem] sm:h-[50rem] sm:w-[55rem] rounded-full bg-[#818cf8] blur-[7rem] sm:blur-[11rem] md:blur-[13rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.08, 0.96, 1.05, 1],
                opacity: [0.28, 0.42, 0.32, 0.38, 0.28],
                x: ["0%", "-4%", "3%", "-2%", "0%"],
                y: ["0%", "-2%", "3%", "-1%", "0%"],
              }}
              transition={{
                duration: 7,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Node 2: Top-Left Crisp Sky/Cyan Breeze */}
          <div className="absolute top-[2rem] sm:top-[4rem] left-[-8rem] sm:left-[-6rem] md:left-[-12rem] pointer-events-none">
            <motion.div
              className="pointer-events-none h-[26rem] w-[26rem] sm:h-[45rem] sm:w-[50rem] rounded-full bg-[#38bdf8] blur-[7rem] sm:blur-[11rem] md:blur-[13rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.06, 0.95, 1.04, 1],
                opacity: [0.24, 0.38, 0.28, 0.35, 0.24],
                x: ["0%", "4%", "-3%", "2%", "0%"],
                y: ["0%", "3%", "-2%", "2%", "0%"],
              }}
              transition={{
                duration: 8.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Node 3: Mid-Page Soft Rose-Violet Quartz Glow */}
          <div className="absolute top-[38%] sm:top-[35%] right-[-10rem] sm:right-[-8rem] pointer-events-none">
            <motion.div
              className="pointer-events-none h-[24rem] w-[24rem] sm:h-[40rem] sm:w-[44rem] rounded-full bg-[#c084fc] blur-[8rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.07, 0.94, 1.03, 1],
                opacity: [0.20, 0.34, 0.24, 0.30, 0.20],
                x: ["0%", "-3%", "2%", "-1%", "0%"],
                y: ["0%", "4%", "-3%", "1%", "0%"],
              }}
              transition={{
                duration: 10,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Node 4: Lower-Left Azure Wave */}
          <div className="absolute top-[65%] sm:top-[60%] left-[-10rem] sm:left-[-8rem] pointer-events-none">
            <motion.div
              className="pointer-events-none h-[26rem] w-[26rem] sm:h-[44rem] sm:w-[48rem] rounded-full bg-[#67e8f9] blur-[8rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.05, 0.97, 1.04, 1],
                opacity: [0.22, 0.35, 0.26, 0.32, 0.22],
                x: ["0%", "3%", "-2%", "1%", "0%"],
                y: ["0%", "-3%", "2%", "-1%", "0%"],
              }}
              transition={{
                duration: 11,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
        </div>

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
          (Deep midnight indigo-slate — rich, vibrant, alive, never flat pitch-black)
         ========================================================================= */}
      <div
        className="absolute inset-0 w-full h-full min-h-[100dvh] bg-gradient-to-b from-[#0f0c24] via-[#0a0818] to-[#06050e] transform-gpu overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-300 ease-out will-change-[opacity]"
        style={{ willChange: "opacity" }}
      >
        {/* Top radial atmospheric midnight indigo sheen */}
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_100%_80%_at_50%_-15%,rgba(99,102,241,0.28),rgba(0,0,0,0))] pointer-events-none" />

        <div className="absolute inset-0 w-full h-full pointer-events-none animate-glow-in">
          {/* Node 1: Top-Right Deep Cosmic Indigo/Violet Aura */}
          <div className="absolute top-[-6rem] sm:top-[-10rem] right-[-6rem] sm:right-[3rem] pointer-events-none">
            <motion.div
              className="pointer-events-none h-[28rem] w-[28rem] sm:h-[50rem] sm:w-[58rem] rounded-full bg-[#6366f1] blur-[7rem] sm:blur-[11rem] md:blur-[13rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.08, 0.96, 1.05, 1],
                opacity: [0.32, 0.48, 0.36, 0.45, 0.32],
                x: ["0%", "-4%", "3%", "-2%", "0%"],
                y: ["0%", "-2%", "3%", "-1%", "0%"],
              }}
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
              className="pointer-events-none h-[26rem] w-[26rem] sm:h-[45rem] sm:w-[52rem] rounded-full bg-[#0ea5e9] blur-[7rem] sm:blur-[11rem] md:blur-[13rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.06, 0.95, 1.04, 1],
                opacity: [0.26, 0.42, 0.30, 0.38, 0.26],
                x: ["0%", "4%", "-3%", "2%", "0%"],
                y: ["0%", "3%", "-2%", "2%", "0%"],
              }}
              transition={{
                duration: 8.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Node 3: Mid-Page Electric Violet/Amethyst Nebula */}
          <div className="absolute top-[38%] sm:top-[35%] right-[-10rem] sm:right-[-8rem] pointer-events-none">
            <motion.div
              className="pointer-events-none h-[24rem] w-[24rem] sm:h-[42rem] sm:w-[46rem] rounded-full bg-[#8b5cf6] blur-[8rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.07, 0.94, 1.03, 1],
                opacity: [0.22, 0.38, 0.26, 0.35, 0.22],
                x: ["0%", "-3%", "2%", "-1%", "0%"],
                y: ["0%", "4%", "-3%", "1%", "0%"],
              }}
              transition={{
                duration: 11,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>

          {/* Node 4: Lower-Left Deep Ocean Azure Glow */}
          <div className="absolute top-[65%] sm:top-[60%] left-[-10rem] sm:left-[-8rem] pointer-events-none">
            <motion.div
              className="pointer-events-none h-[26rem] w-[26rem] sm:h-[44rem] sm:w-[48rem] rounded-full bg-[#38bdf8] blur-[8rem] sm:blur-[12rem] md:blur-[14rem] transform-gpu will-change-transform"
              style={{ transform: "translateZ(0)" }}
              animate={{
                scale: [1, 1.05, 0.97, 1.04, 1],
                opacity: [0.20, 0.35, 0.24, 0.32, 0.20],
                x: ["0%", "3%", "-2%", "1%", "0%"],
                y: ["0%", "-3%", "2%", "-1%", "0%"],
              }}
              transition={{
                duration: 10,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </div>
        </div>

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
