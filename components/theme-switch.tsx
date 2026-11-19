"use client";

import { useTheme } from "@/context/theme-context";
import React, { useState, useEffect } from "react";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setRippleKey((prev) => prev + 1);
    toggleTheme({ x, y });
  };

  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 450, damping: 24 }}
      style={{
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        isolation: "isolate",
      }}
      className={`fixed top-[calc(1rem+env(safe-area-inset-top,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] sm:top-5 sm:left-6 z-[9999] pointer-events-auto isolate w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center backdrop-blur-2xl backdrop-saturate-150 transform-gpu cursor-pointer outline-none transition-[background-color,border-color,box-shadow] duration-300 group overflow-hidden ${
        isDark
          ? "bg-zinc-950/80 hover:bg-zinc-950/95 border border-sky-400/30 hover:border-sky-400/60 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(56,189,248,0.22)]"
          : "bg-white/85 hover:bg-white border border-amber-400/35 hover:border-amber-500/60 shadow-[0_8px_25px_rgba(245,158,11,0.18),0_0_18px_rgba(245,158,11,0.25)]"
      }`}
      onClick={handleClick}
      aria-label="Toggle theme"
    >
      {/* Dynamic Aura Glow Sheen on Hover */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100 ${
          isDark
            ? "bg-gradient-to-tr from-sky-500/15 via-transparent to-indigo-500/20"
            : "bg-gradient-to-tr from-amber-500/20 via-transparent to-yellow-400/20"
        }`}
        aria-hidden="true"
      />

      {/* Button Click Shockwave Pulse */}
      <AnimatePresence>
        {rippleKey > 0 && (
          <motion.span
            key={rippleKey}
            initial={{ scale: 0.85, opacity: 0.75 }}
            animate={{ scale: 1.55, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`absolute inset-0 rounded-full border pointer-events-none ${
              isDark ? "border-sky-400/60" : "border-amber-400/70"
            }`}
          />
        )}
      </AnimatePresence>

      {/* Modern Morphing Sun / Moon Stars Animation */}
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={mounted ? { opacity: 0, rotate: -70, scale: 0.3 } : false}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 70, scale: 0.3 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="relative flex items-center justify-center pointer-events-none select-none z-10"
          >
            {/* Sun Solar Flare Halo */}
            <div className="absolute w-8 h-8 rounded-full bg-amber-400/25 blur-sm scale-125 animate-pulse pointer-events-none" />
            <BsSunFill className="text-xl sm:text-2xl text-amber-500 relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.65)]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={mounted ? { opacity: 0, rotate: 70, scale: 0.3 } : false}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -70, scale: 0.3 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="relative flex items-center justify-center pointer-events-none select-none z-10"
          >
            {/* Moon Starlight Glow Halo */}
            <div className="absolute w-8 h-8 rounded-full bg-cyan-400/20 blur-sm scale-125 pointer-events-none" />
            <BsMoonStarsFill className="text-lg sm:text-xl text-sky-100 relative z-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
