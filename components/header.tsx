"use client";

import React from "react";
import { motion } from "framer-motion";
import { links } from "@/lib/data";
import clsx from "clsx";
import { useActiveSectionContext } from "@/context/active-section-context";
import type { SectionName } from "@/lib/types";

export default function Header() {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();

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

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto flex items-center justify-center max-w-[calc(100vw-2rem)] animate-header-in">
        <nav
          style={{
            backdropFilter: "blur(28px) saturate(180%)",
            WebkitBackdropFilter: "blur(28px) saturate(180%)",
          }}
          className="flex items-center justify-center rounded-full border border-white/40 dark:border-white/15 bg-white/65 dark:bg-slate-900/65 p-1 sm:p-1.5 shadow-xl shadow-black/[0.06] dark:shadow-black/50 hover:scale-105 transition-all duration-300 ease-in-out pointer-events-auto transform-gpu origin-center will-change-transform"
        >
        <ul className="flex items-center justify-center gap-1.5 sm:gap-2 text-[0.78rem] sm:text-[0.9rem] font-medium text-gray-700 dark:text-gray-300">
          {links.map((link) => {
            const isActive = activeSection === link.name;

            return (
              <li
                className={clsx(
                  "flex items-center justify-center relative",
                  isActive ? "z-10" : "hover:z-10"
                )}
                key={link.hash}
              >
                <motion.a
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  whileHover={{ scale: isActive ? 1.12 : 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  className={clsx(
                    "flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:text-gray-950 dark:hover:text-white transition-colors duration-200 ease-in-out whitespace-nowrap cursor-pointer relative",
                    {
                      "text-gray-950 dark:text-white font-semibold": isActive,
                      "hover:bg-white/20 dark:hover:bg-white/10": !isActive,
                    }
                  )}
                  href={link.hash}
                  onClick={(e) => handleNavClick(e, link.name, link.hash)}
                >
                  {link.name}

                  {isActive && (
                    <motion.span
                      className="bg-white/40 dark:bg-white/20 rounded-full absolute inset-0 -z-10 backdrop-blur-xl border border-white/40 dark:border-white/30 shadow-sm"
                      layoutId="activeSection"
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
      </nav>
    </header>
  </>
  );
}
