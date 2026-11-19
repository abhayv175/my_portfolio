"use client";

import { useTheme } from "@/context/theme-context";
import React from "react";
import { BsMoon, BsSun } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
        isolation: "isolate",
      }}
      className="fixed top-[calc(1rem+env(safe-area-inset-top,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] sm:top-5 sm:left-6 z-[9999] pointer-events-auto isolate w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white/80 hover:bg-white/95 dark:bg-zinc-950/80 dark:hover:bg-zinc-950/95 border border-black/10 hover:border-black/20 dark:border-white/15 dark:hover:border-white/25 shadow-lg shadow-black/[0.04] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150 transform-gpu cursor-pointer outline-none transition-all duration-300 group overflow-hidden"
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
          initial={mounted ? { opacity: 0, rotate: -90, scale: 0.5 } : false}
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
