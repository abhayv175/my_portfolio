"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { links } from "@/lib/data";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";
import type { SectionName } from "@/lib/types";

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    linkName: SectionName,
    hash: string
  ) => {
    e.preventDefault();
    setActiveSection(linkName);
    setTimeOfLastClick(Date.now());

    const targetId = hash.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Top Viewport Soft Fade Mask (Apple scroll-edge diffusion) */}
      <div
        className="fixed top-0 inset-x-0 h-28 z-[9990] pointer-events-none bg-gradient-to-b from-slate-50/80 via-slate-50/40 to-transparent dark:from-[#09090b]/80 dark:via-[#09090b]/40 dark:to-transparent backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,black_25%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_25%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Desktop Navigation Pill (Hidden on Mobile, Visible on Desktop/Tablet) */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none hidden md:flex items-center justify-center max-w-[calc(100vw-2rem)] animate-header-in">
        <nav
          style={{
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            backfaceVisibility: "hidden",
            outline: "1px solid transparent",
          }}
          className="flex items-center justify-center rounded-full border border-white/40 dark:border-white/15 bg-white/65 dark:bg-slate-900/65 p-1 sm:p-1.5 shadow-xl shadow-black/[0.06] dark:shadow-black/50 pointer-events-auto transform-gpu origin-center will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent hover:scale-105 active:scale-[1.02] transition-transform duration-300 ease-out"
        >
          <ul className="flex items-center justify-center gap-0 text-[0.8rem] sm:text-[0.9rem] font-medium text-gray-700 dark:text-gray-300">
            {links.map((link) => {
              const isActive = activeSection === link.name;

              return (
                <li
                  className={clsx(
                    "flex items-center justify-center relative transform-gpu will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d]",
                    isActive ? "z-10" : "hover:z-10"
                  )}
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    outline: "1px solid transparent",
                  }}
                  key={link.hash}
                >
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    style={{
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      outline: "1px solid transparent",
                    }}
                    className={clsx(
                      "flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full hover:text-gray-950 dark:hover:text-white transition-all duration-200 ease-out whitespace-nowrap cursor-pointer relative transform-gpu will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent",
                      {
                        "text-gray-950 dark:text-white font-semibold": isActive,
                        "hover:bg-white/25 dark:hover:bg-white/10": !isActive,
                      }
                    )}
                    href={link.hash}
                    onClick={(e) => handleNavClick(e, link.name, link.hash)}
                  >
                    <span className="relative z-10 transform-gpu [backface-visibility:hidden]">
                      {link.name}
                    </span>

                    {isActive && (
                      <motion.span
                        className="bg-white/40 dark:bg-white/20 rounded-full absolute inset-0 -z-0 backdrop-blur-xl border border-white/40 dark:border-white/30 shadow-sm transform-gpu will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent"
                        layoutId="activeSection"
                        layoutDependency={false}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        style={{
                          transform: "translateZ(0)",
                          backfaceVisibility: "hidden",
                          outline: "1px solid transparent",
                        }}
                      />
                    )}
                  </motion.a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Mobile Hamburger / 3-Line Morphing Toggle Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
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
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] pointer-events-auto isolate md:hidden w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/45 dark:bg-black/50 dark:hover:bg-black/70 border border-white/20 hover:border-white/35 dark:border-white/10 dark:hover:border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-md transform-gpu cursor-pointer outline-none transition-colors duration-300 group overflow-hidden"
      >
        {/* Subtle radial sheen on hover */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex items-center justify-center transform-gpu [backface-visibility:hidden] relative z-10 pointer-events-none select-none">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] select-none pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.line
              x1="4"
              y1="6"
              x2="20"
              y2="6"
              animate={
                isOpen
                  ? { x1: 6, y1: 6, x2: 18, y2: 18 }
                  : { x1: 4, y1: 6, x2: 20, y2: 6 }
              }
              transition={{ duration: 0.25, ease: "easeInOut" }}
            />
            <motion.line
              x1="4"
              y1="12"
              x2="20"
              y2="12"
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
            <motion.line
              x1="4"
              y1="18"
              x2="20"
              y2="18"
              animate={
                isOpen
                  ? { x1: 6, y1: 18, x2: 18, y2: 6 }
                  : { x1: 4, y1: 18, x2: 20, y2: 18 }
              }
              transition={{ duration: 0.25, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </motion.button>

      {/* Mobile Navigation Drawer & Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9995] bg-black/40 dark:bg-black/60 backdrop-blur-sm md:hidden pointer-events-auto"
              aria-hidden="true"
            />

            {/* Mobile Navigation Drawer Modal */}
            <motion.nav
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              style={{
                backdropFilter: "blur(28px) saturate(150%)",
                WebkitBackdropFilter: "blur(28px) saturate(150%)",
              }}
              className="fixed top-[4.5rem] right-4 sm:top-[5.5rem] sm:right-6 z-[9998] w-[calc(100vw-2rem)] max-w-xs md:hidden bg-slate-900/60 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl border border-white/15 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-3 flex flex-col gap-1 pointer-events-auto"
            >
              <ul className="flex flex-col gap-1 w-full">
                {links.map((link) => {
                  const isActive = activeSection === link.name;

                  return (
                    <li key={link.hash} className="w-full relative">
                      <motion.a
                        href={link.hash}
                        whileTap={{ scale: 0.97 }}
                        onClick={(e) => {
                          handleNavClick(e, link.name, link.hash);
                          setIsOpen(false);
                        }}
                        className={clsx(
                          "flex items-center justify-between py-2.5 px-4 rounded-full text-[0.95rem] transition-colors duration-200 relative whitespace-nowrap cursor-pointer",
                          isActive
                            ? "text-white font-semibold"
                            : "text-white/70 hover:text-white hover:bg-white/5 font-medium"
                        )}
                      >
                        <span className="relative z-10">{link.name}</span>

                        {isActive && (
                          <motion.div
                            layoutId="activeMobileSection"
                            className="absolute inset-0 rounded-full bg-white/15 dark:bg-white/10 border border-white/10 shadow-sm"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10" />
                        )}
                      </motion.a>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
