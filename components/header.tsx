"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { links } from "@/lib/data";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";
import type { SectionName } from "@/lib/types";
import { BsArrowRight } from "react-icons/bs";

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
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
    setActiveSection(linkName);
    setTimeOfLastClick(Date.now());
    document.body.style.overflow = "";
    setIsOpen(false);

    const targetId = hash.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = links.filter((link) => link.name !== "Contact");
  const isActiveContact = activeSection === "Contact";

  return (
    <>
      {/* Top Viewport Soft Fade Mask (Apple scroll-edge diffusion) */}
      <div
        className="fixed top-0 inset-x-0 h-28 z-[9990] pointer-events-none bg-gradient-to-b from-[#f3f0ff]/80 via-[#f3f0ff]/40 to-transparent dark:from-[#0a0818]/80 dark:via-[#0a0818]/40 dark:to-transparent backdrop-blur-[8px] [mask-image:linear-gradient(to_bottom,black_25%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_25%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Subtle top ambient glow hairline (inspired by screenshot) */}
      <div
        className="fixed top-0 inset-x-0 h-[1px] z-[9991] pointer-events-none bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-indigo-400/30 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.25)]"
        aria-hidden="true"
      />

      {/* Desktop Navigation Pill (Hidden on Mobile, Visible on Desktop/Tablet) */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none hidden md:flex items-center justify-center max-w-[calc(100vw-2rem)] animate-header-in">
        <nav
          style={{
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
            backfaceVisibility: "hidden",
            outline: "1px solid transparent",
          }}
          className="flex items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/75 p-1 sm:p-1.5 shadow-lg shadow-black/[0.04] dark:shadow-[0_12px_40px_rgba(0,0,0,0.65)] pointer-events-auto transform-gpu origin-center will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 ease-out"
        >
          <ul className="flex items-center justify-center gap-0.5 text-[0.8rem] sm:text-[0.88rem] font-medium text-gray-700 dark:text-gray-300">
            {navLinks.map((link) => {
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
                      "flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-colors duration-200 ease-out whitespace-nowrap cursor-pointer relative transform-gpu will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent",
                      {
                        "text-zinc-950 dark:text-white font-semibold": isActive,
                        "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-medium": !isActive,
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
                        className="rounded-full absolute inset-0 -z-0 border border-indigo-500/40 dark:border-indigo-400/50 bg-indigo-500/10 dark:bg-indigo-950/60 shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl transform-gpu will-change-[transform,opacity] [backface-visibility:hidden] [transform-style:preserve-3d]"
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

          {/* Elegant Vertical Divider */}
          <div className="h-4 w-px bg-black/10 dark:bg-white/15 mx-1" aria-hidden="true" />

          {/* Contact Me Here CTA Button at End of Navbar */}
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
              isActiveContact
                ? "bg-indigo-600 dark:bg-white text-white dark:text-zinc-950 shadow-[0_0_20px_rgba(99,102,241,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-indigo-500 dark:border-white"
                : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-black/10 dark:border-white/15 shadow-sm hover:shadow-md dark:hover:border-white/25"
            )}
          >
            <span>Contact me</span>
            <BsArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
          </motion.a>
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
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] pointer-events-auto isolate md:hidden w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white/80 hover:bg-white/95 dark:bg-zinc-950/80 dark:hover:bg-zinc-950/95 border border-black/10 dark:border-white/15 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl backdrop-saturate-150 transform-gpu cursor-pointer outline-none transition-all duration-300 group overflow-hidden"
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
              className="fixed inset-0 z-[9995] bg-black/30 dark:bg-black/70 backdrop-blur-sm md:hidden pointer-events-auto"
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
              className="fixed top-[4.5rem] right-4 sm:top-[5.5rem] sm:right-6 z-[9998] w-[82%] max-w-[280px] md:hidden bg-white/90 dark:bg-zinc-950/90 border border-black/10 dark:border-white/15 text-slate-900 backdrop-blur-2xl shadow-2xl dark:text-white dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-3xl p-3 flex flex-col gap-2 pointer-events-auto"
            >
              <ul className="flex flex-col gap-1 w-full rounded-2xl p-1 bg-white/60 border border-black/5 text-slate-800 dark:bg-white/5 dark:border-white/10 dark:text-white">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.name;

                  return (
                    <li key={link.hash} className="w-full relative">
                      <motion.a
                        href={link.hash}
                        whileTap={{ scale: 0.97 }}
                        onClick={(e) => handleNavClick(e, link.name, link.hash)}
                        className={clsx(
                          "flex items-center justify-between py-2.5 px-4 rounded-full text-[0.92rem] transition-colors duration-200 relative whitespace-nowrap cursor-pointer",
                          isActive
                            ? "text-zinc-950 dark:text-white font-semibold"
                            : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-medium"
                        )}
                      >
                        <span className="relative z-10">{link.name}</span>

                        {isActive && (
                          <motion.div
                            layoutId="activeMobileSection"
                            className="absolute inset-0 rounded-full border border-indigo-500/40 dark:border-indigo-400/50 bg-indigo-500/10 dark:bg-indigo-950/60 shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] relative z-10" />
                        )}
                      </motion.a>
                    </li>
                  );
                })}
              </ul>

              {/* Mobile Featured Contact Me CTA Button */}
              <motion.a
                href="#contact"
                whileTap={{ scale: 0.96 }}
                onClick={(e) => handleNavClick(e, "Contact", "#contact")}
                className={clsx(
                  "flex items-center justify-center gap-2 py-3 px-4 rounded-full text-[0.92rem] font-semibold transition-all duration-300 cursor-pointer shadow-lg",
                  isActiveContact
                    ? "bg-indigo-600 dark:bg-white text-white dark:text-zinc-950 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-500 dark:border-white"
                    : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 border border-black/10 dark:border-indigo-400/30"
                )}
              >
                <span>Contact me here</span>
                <BsArrowRight className="text-sm" />
              </motion.a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
