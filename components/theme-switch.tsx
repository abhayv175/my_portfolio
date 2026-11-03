"use client";

import { useTheme } from "@/context/theme-context";
import React from "react";
import { BsMoon, BsSun } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
      className="fixed top-6 right-6 sm:top-7 sm:right-8 z-[9999] w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white/65 hover:bg-white/80 dark:bg-slate-900/55 dark:hover:bg-slate-900/75 border border-white/80 hover:border-white ring-1 ring-slate-900/10 dark:ring-0 dark:border-white/30 dark:hover:border-white/45 shadow-[0_8px_30px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.16),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.45)] backdrop-blur-2xl backdrop-saturate-150 transform-gpu cursor-pointer outline-none transition-colors duration-300 group overflow-hidden"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {/* Subtle radial sheen on hover */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="flex items-center justify-center transform-gpu [backface-visibility:hidden] relative z-10 pointer-events-none select-none"
        >
          {theme === "light" ? (
            <BsSun className="text-xl sm:text-2xl text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.45)]" />
          ) : (
            <BsMoon className="text-lg sm:text-xl text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
