"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSound } from "@/context/sound-context";

/**
 * Minimal bottom-left editorial SOUND / strikethrough toggle matching the
 * website's monochrome typography. Starts muted by default.
 */
export default function SoundToggle() {
  const { isSoundEnabled, toggleSound } = useSound();

  return (
    <motion.button
      type="button"
      onClick={toggleSound}
      initial={{ opacity: 0, y: 14 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.95, delay: 0.45, ease: [0.22, 0.61, 0.36, 1] },
      }}
      whileTap={{ scale: 0.94 }}
      aria-label={isSoundEnabled ? "Mute space sound" : "Enable space sound"}
      aria-pressed={isSoundEnabled}
      title={isSoundEnabled ? "Mute space sound" : "Enable space sound"}
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-[calc(1.25rem+env(safe-area-inset-left,0px))] sm:bottom-6 sm:left-6 z-[9990] px-2 py-2 -mx-2 -my-2 cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-zinc-900/40 dark:focus-visible:ring-white/40 rounded-sm group"
    >
      <span className="relative inline-flex items-center text-[0.72rem] sm:text-xs font-semibold uppercase tracking-[0.26em] -mr-[0.26em] text-zinc-900/75 group-hover:text-zinc-950 dark:text-white/75 dark:group-hover:text-white drop-shadow-[0_1px_10px_rgba(255,255,255,0.92)] dark:drop-shadow-[0_1px_10px_rgba(4,4,8,0.92)] transition-colors duration-200">
        <span>SOUND</span>
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            scaleX: isSoundEnabled ? 0 : 1,
            opacity: isSoundEnabled ? 0 : 1,
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: isSoundEnabled ? "right center" : "left center" }}
          className="pointer-events-none absolute -left-[2px] right-[0.18em] top-1/2 h-[1.5px] -translate-y-1/2 bg-current"
        />
      </span>
    </motion.button>
  );
}
