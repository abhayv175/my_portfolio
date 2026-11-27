"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { links } from "@/lib/data";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";
import type { SectionName } from "@/lib/types";
import { BsArrowRight } from "react-icons/bs";
import { useLenis } from "lenis/react";
import { scrollToSection } from "@/lib/scroll-to-section";
import Magnetic from "@/components/magnetic";
import { SURFACE } from "./surface-styles";

const NAV_TAB_THEMES: Record<
  string,
  {
    hoverClass: string;
    activeText: string;
    activePill: string;
  }
> = {
  Home: {
    hoverClass:
      "hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] border border-transparent hover:border-violet-500/45",
    activeText: "text-violet-800 dark:text-white font-bold",
    activePill:
      "border-violet-600/70 dark:border-violet-400/60 bg-violet-500/25 dark:bg-violet-500/25 shadow-[0_0_22px_rgba(139,92,246,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_0_22px_rgba(139,92,246,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
  },
  About: {
    hoverClass:
      "hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-transparent hover:border-cyan-500/45",
    activeText: "text-cyan-800 dark:text-white font-bold",
    activePill:
      "border-cyan-600/70 dark:border-cyan-400/60 bg-cyan-500/25 dark:bg-cyan-500/25 shadow-[0_0_22px_rgba(6,182,212,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_0_22px_rgba(6,182,212,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
  },
  Experience: {
    hoverClass:
      "hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-500/20 hover:shadow-[0_0_22px_rgba(14,165,233,0.4)] border border-transparent hover:border-sky-500/45",
    activeText: "text-sky-800 dark:text-sky-200 font-bold",
    activePill:
      "border-sky-600/70 dark:border-sky-400/60 bg-sky-500/25 dark:bg-sky-500/25 shadow-[0_0_24px_rgba(14,165,233,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_0_25px_rgba(56,189,248,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)]",
  },
  Projects: {
    hoverClass:
      "hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-500/20 hover:shadow-[0_0_22px_rgba(99,102,241,0.4)] border border-transparent hover:border-indigo-500/45",
    activeText: "text-indigo-800 dark:text-indigo-200 font-bold",
    activePill:
      "border-indigo-600/70 dark:border-indigo-400/60 bg-indigo-500/25 dark:bg-indigo-500/25 shadow-[0_0_24px_rgba(99,102,241,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_0_25px_rgba(99,102,241,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)]",
  },
  Skills: {
    hoverClass:
      "hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-500/20 hover:shadow-[0_0_22px_rgba(168,85,247,0.4)] border border-transparent hover:border-purple-500/45",
    activeText: "text-purple-800 dark:text-purple-200 font-bold",
    activePill:
      "border-purple-600/70 dark:border-purple-400/60 bg-purple-500/25 dark:bg-purple-500/25 shadow-[0_0_24px_rgba(168,85,247,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_0_25px_rgba(168,85,247,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)]",
  },
};

function getContactCtaClass(isActiveContact: boolean) {
  return isActiveContact
    ? "bg-indigo-600 dark:bg-white text-white dark:text-zinc-950 shadow-[0_0_20px_rgba(99,102,241,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-indigo-500 dark:border-white"
    : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-black/10 dark:border-white/15 shadow-sm hover:shadow-md dark:hover:border-white/25";
}

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
  const lenis = useLenis();
  const [isOpen, setIsOpen] = useState(false);

  // Lock background scroll and close drawer on Escape key press
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    linkName: SectionName,
    hash: string
  ) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement)?.blur();
    document.body.style.overflow = "";
    setIsOpen(false);
    const durationMs = scrollToSection(hash, lenis);
    setActiveSection(linkName);
    setTimeOfLastClick(Date.now() + Math.max(0, durationMs - 850));
  };

  const navLinks = links.filter((link) => link.name !== "Contact");
  const isActiveContact = activeSection === "Contact";

  return (
    <>
      {/* Top Viewport Soft Fade Mask (Apple scroll-edge diffusion) */}
      <div
        className="fixed top-0 inset-x-0 h-28 z-[9990] pointer-events-none bg-gradient-to-b from-white/75 via-white/30 to-transparent dark:from-[#040408]/75 dark:via-[#040408]/30 dark:to-transparent backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,black_25%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_25%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Subtle top ambient glow hairline */}
      <div
        className="fixed top-0 inset-x-0 h-[1px] z-[9991] pointer-events-none bg-gradient-to-r from-transparent via-black/15 dark:via-white/20 to-transparent"
        aria-hidden="true"
      />

      {/* Desktop Navigation Pill (Hidden on Mobile, Visible on Desktop/Tablet) */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none hidden md:flex items-center justify-center max-w-[calc(100vw-2rem)] animate-header-in">
        <nav
          style={{
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            backfaceVisibility: "hidden",
            outline: "1px solid transparent",
          }}
          className={`flex items-center justify-center rounded-full ${SURFACE.pillBase} p-1 sm:p-1.5 shadow-lg shadow-black/[0.04] dark:shadow-[0_12px_40px_rgba(0,0,0,0.65)] pointer-events-auto transform-gpu origin-center will-change-transform backface-hidden [backface-visibility:hidden] outline outline-1 outline-transparent hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 ease-out`}
        >
          <ul className="flex items-center justify-center gap-0.5 text-[0.8rem] sm:text-[0.88rem] font-medium text-gray-700 dark:text-gray-300">
            {navLinks.map((link) => {
              const isActive = activeSection === link.name;
              const themeConfig = NAV_TAB_THEMES[link.name];

              return (
                <li
                  className={clsx(
                    "flex items-center justify-center relative transform-gpu will-change-[transform,opacity] [backface-visibility:hidden]",
                    isActive ? "z-10" : "hover:z-10"
                  )}
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    outline: "1px solid transparent",
                  }}
                  key={link.hash}
                >
                  <Magnetic strength={0.25}>
                    <motion.a
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 24,
                      }}
                      style={{
                        transform: "translateZ(0)",
                        backfaceVisibility: "hidden",
                        outline: "1px solid transparent",
                      }}
                      className={clsx(
                        "flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-200 ease-out whitespace-nowrap cursor-pointer relative transform-gpu will-change-[transform,opacity] [backface-visibility:hidden] outline outline-1 outline-transparent",
                        isActive
                          ? themeConfig?.activeText || "text-zinc-950 dark:text-white font-bold"
                          : clsx("text-zinc-600 dark:text-zinc-400 font-medium", themeConfig?.hoverClass || "hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5")
                      )}
                      href={link.hash}
                      onClick={(e) => handleNavClick(e, link.name, link.hash)}
                    >
                      <span className="relative z-10 transform-gpu [backface-visibility:hidden]">
                        {link.name}
                      </span>

                      {isActive && (
                        <motion.span
                          className={clsx(
                            "rounded-full absolute inset-0 -z-0 border backdrop-blur-xl transform-gpu will-change-[transform,opacity] [backface-visibility:hidden]",
                            themeConfig?.activePill || "border-indigo-500/40 dark:border-indigo-400/50 bg-indigo-500/25 dark:bg-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                          )}
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
                  </Magnetic>
                </li>
              );
            })}
          </ul>

          {/* Elegant Vertical Divider */}
          <div className="h-4 w-px bg-black/10 dark:bg-white/15 mx-1" aria-hidden="true" />

          {/* Contact Me Here CTA Button at End of Navbar */}
          <Magnetic strength={0.3}>
            <motion.a
              href="#contact"
              onClick={(e) => handleNavClick(e, "Contact", "#contact")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
              className={clsx(
                "group flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[0.8rem] sm:text-[0.88rem] font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer relative transform-gpu will-change-[transform,opacity] [backface-visibility:hidden]",
                getContactCtaClass(isActiveContact)
              )}
            >
              <span>Contact me</span>
              <BsArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </Magnetic>
        </nav>
      </header>

      {/* Mobile Hamburger / 3-Line Morphing Toggle Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        initial={{ opacity: 0, scale: 0.86, y: -10 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0.95, delay: 0.22, ease: [0.22, 0.61, 0.36, 1] },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          isolation: "isolate",
        }}
        className={`fixed top-[calc(1rem+env(safe-area-inset-top,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:top-6 sm:right-6 z-[9999] pointer-events-auto isolate md:hidden w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${SURFACE.pillInteractive} shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transform-gpu cursor-pointer outline-none transition-all duration-300 group overflow-hidden`}
      >
        {/* Subtle radial sheen on hover */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex items-center justify-center transform-gpu [backface-visibility:hidden] relative z-10 pointer-events-none select-none">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white stroke-[2.5] drop-shadow-[0_0_6px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] select-none pointer-events-none transition-colors duration-200"
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
              initial={{ x1: 4, y1: 6, x2: 20, y2: 6 }}
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
              initial={{ opacity: 1 }}
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
            <motion.line
              x1="4"
              y1="18"
              x2="20"
              y2="18"
              initial={{ x1: 4, y1: 18, x2: 20, y2: 18 }}
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
            {/* Subtle Backdrop Overlay so WebGPU hole stays visible behind translucent pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9995] bg-black/10 dark:bg-black/25 backdrop-blur-[3px] md:hidden pointer-events-auto"
              aria-hidden="true"
            />

            {/* Mobile Navigation Pill Drawer (Vertical twin of Desktop Scroll Navbar) */}
            <motion.nav
              initial={{ opacity: 0, scale: 0.94, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -8 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                transformOrigin: "top right",
              }}
              className={`fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:top-[5.5rem] sm:right-6 z-[9998] w-[13.5rem] max-w-[calc(100vw-2rem)] md:hidden ${SURFACE.pillBase} rounded-[1.75rem] p-1.5 shadow-lg shadow-black/[0.04] dark:shadow-[0_12px_40px_rgba(0,0,0,0.65)] hover:border-black/20 dark:hover:border-white/20 flex flex-col gap-1 pointer-events-auto transition-colors duration-300`}
            >
              <ul className="flex flex-col gap-0.5 w-full text-[0.88rem] font-medium text-gray-700 dark:text-gray-300">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.name;
                  const themeConfig = NAV_TAB_THEMES[link.name];

                  return (
                    <li key={link.hash} className="w-full relative">
                      <motion.a
                        href={link.hash}
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => handleNavClick(e, link.name, link.hash)}
                        className={clsx(
                          "flex items-center justify-center py-2 px-4 rounded-full transition-all duration-200 relative whitespace-nowrap cursor-pointer",
                          isActive
                            ? themeConfig?.activeText || "text-zinc-950 dark:text-white font-bold"
                            : clsx(
                                "text-zinc-600 dark:text-zinc-400 font-medium border border-transparent",
                                themeConfig?.hoverClass ||
                                  "hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                              )
                        )}
                      >
                        <span className="relative z-10">{link.name}</span>

                        {isActive && (
                          <motion.div
                            layoutId="activeMobileSection"
                            className={clsx(
                              "absolute inset-0 rounded-full border backdrop-blur-xl",
                              themeConfig?.activePill ||
                                "border-indigo-500/40 dark:border-indigo-400/50 bg-indigo-500/25 dark:bg-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]"
                            )}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                      </motion.a>
                    </li>
                  );
                })}
              </ul>

              {/* Hairline Divider matching Desktop Navbar */}
              <div
                className="h-px w-[calc(100%-1rem)] mx-auto bg-black/10 dark:bg-white/15 my-0.5"
                aria-hidden="true"
              />

              {/* Contact Me CTA Button matching Desktop Navbar */}
              <motion.a
                href="#contact"
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleNavClick(e, "Contact", "#contact")}
                className={clsx(
                  "group flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-[0.88rem] font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer",
                  getContactCtaClass(isActiveContact)
                )}
              >
                <span>Contact me</span>
                <BsArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
              </motion.a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
