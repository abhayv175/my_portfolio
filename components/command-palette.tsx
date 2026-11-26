"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/theme-context";
import { useActiveSectionContext } from "@/context/active-section-context";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiCommand,
  FiArrowRight,
  FiCopy,
  FiDownload,
  FiMoon,
  FiSun,
  FiFolder,
  FiExternalLink,
  FiCornerDownLeft,
} from "react-icons/fi";
import type { SectionName } from "@/lib/types";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Quick Actions" | "Filter Projects" | "Social";
  icon: React.ReactNode;
  keywords?: string[];
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  const navigateTo = (section: SectionName, hash: string) => {
    setActiveSection(section);
    setTimeOfLastClick(Date.now());
    setIsOpen(false);
    const element = document.getElementById(hash.replace("#", ""));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("abhayv175@gmail.com");
    toast.success("Email copied to clipboard: abhayv175@gmail.com", {
      icon: "📋",
      style: {
        borderRadius: "9999px",
        background: theme === "dark" ? "#18181b" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#18181b",
        border: "1px solid rgba(99, 102, 241, 0.3)",
      },
    });
    setIsOpen(false);
  };

  const downloadCV = () => {
    const link = document.createElement("a");
    link.href = "/CV.pdf";
    link.download = "Abhay_Verma_CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading CV...", { icon: "📄" });
    setIsOpen(false);
  };

  const filterProject = (tag: string, matchedProjects: string[]) => {
    navigateTo("Projects", "#projects");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("highlight-projects", {
          detail: { projects: matchedProjects, scrollToCard: true },
        })
      );
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("highlight-projects", {
            detail: { projects: [], scrollToCard: false },
          })
        );
      }, 3500);
    }
    toast(`Highlighting projects matching "${tag}"`, {
      icon: "🔍",
      style: {
        borderRadius: "9999px",
        background: theme === "dark" ? "#18181b" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#18181b",
        border: "1px solid rgba(99, 102, 241, 0.3)",
      },
    });
  };

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-home",
      title: "Jump to Home",
      category: "Navigation",
      icon: <FiArrowRight className="text-indigo-400" />,
      keywords: ["intro", "start", "top"],
      action: () => navigateTo("Home", "#home"),
    },
    {
      id: "nav-about",
      title: "Jump to About",
      category: "Navigation",
      icon: <FiArrowRight className="text-indigo-400" />,
      keywords: ["bio", "background", "summary"],
      action: () => navigateTo("About", "#about"),
    },
    {
      id: "nav-experience",
      title: "Jump to Experience",
      category: "Navigation",
      icon: <FiArrowRight className="text-indigo-400" />,
      keywords: ["work", "career", "history", "jobs"],
      action: () => navigateTo("Experience", "#experience"),
    },
    {
      id: "nav-projects",
      title: "Jump to Projects",
      category: "Navigation",
      icon: <FiArrowRight className="text-indigo-400" />,
      keywords: ["portfolio", "work", "apps", "code"],
      action: () => navigateTo("Projects", "#projects"),
    },
    {
      id: "nav-skills",
      title: "Jump to Skills",
      category: "Navigation",
      icon: <FiArrowRight className="text-indigo-400" />,
      keywords: ["tech", "technologies", "stack", "languages"],
      action: () => navigateTo("Skills", "#skills"),
    },
    {
      id: "nav-contact",
      title: "Jump to Contact",
      category: "Navigation",
      icon: <FiArrowRight className="text-indigo-400" />,
      keywords: ["email", "message", "hire", "reach"],
      action: () => navigateTo("Contact", "#contact"),
    },

    // Quick Actions
    {
      id: "act-copy-email",
      title: "Copy Email Address",
      subtitle: "abhayv175@gmail.com",
      category: "Quick Actions",
      icon: <FiCopy className="text-emerald-400" />,
      keywords: ["email", "clipboard", "mail"],
      action: copyEmail,
    },
    {
      id: "act-download-cv",
      title: "Download CV / Resume",
      subtitle: "Abhay_Verma_CV.pdf",
      category: "Quick Actions",
      icon: <FiDownload className="text-sky-400" />,
      keywords: ["resume", "cv", "pdf", "hire"],
      action: downloadCV,
    },
    {
      id: "act-toggle-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Quick Actions",
      icon:
        theme === "dark" ? (
          <FiSun className="text-amber-400" />
        ) : (
          <FiMoon className="text-indigo-400" />
        ),
      keywords: ["mode", "theme", "dark", "light", "color"],
      action: () => {
        toggleTheme();
        setIsOpen(false);
      },
    },

    // Filter Projects by Stack
    {
      id: "filter-python",
      title: "Filter by FastAPI & Python",
      subtitle: "View PrintPulse architecture",
      category: "Filter Projects",
      icon: <FiFolder className="text-amber-400" />,
      keywords: ["fastapi", "python", "backend", "websockets", "printpulse"],
      action: () => filterProject("FastAPI & Python", ["PrintPulse"]),
    },
    {
      id: "filter-flutter",
      title: "Filter by Flutter & Mobile",
      subtitle: "View PrintPulse vendor tablet app",
      category: "Filter Projects",
      icon: <FiFolder className="text-cyan-400" />,
      keywords: ["flutter", "mobile", "android", "dart"],
      action: () => filterProject("Flutter", ["PrintPulse"]),
    },
    {
      id: "filter-react",
      title: "Filter by React & Next.js",
      subtitle: "View Move It & Passenger Text",
      category: "Filter Projects",
      icon: <FiFolder className="text-blue-400" />,
      keywords: ["react", "nextjs", "typescript", "frontend"],
      action: () => filterProject("React & Next.js", ["Move It", "Passenger Text"]),
    },
    {
      id: "filter-unity",
      title: "Filter by Unity & C#",
      subtitle: "View Pika Panic Vilnius game",
      category: "Filter Projects",
      icon: <FiFolder className="text-purple-400" />,
      keywords: ["unity", "c#", "game", "pika panic"],
      action: () => filterProject("Unity & C#", ["Pika Panic"]),
    },

    // Social & Code Links
    {
      id: "soc-github",
      title: "Open GitHub Profile",
      subtitle: "github.com/abhayv175",
      category: "Social",
      icon: <FiExternalLink className="text-zinc-400" />,
      keywords: ["github", "repos", "code", "git"],
      action: () => {
        window.open("https://github.com/abhayv175", "_blank", "noopener,noreferrer");
        setIsOpen(false);
      },
    },
    {
      id: "soc-linkedin",
      title: "Open LinkedIn Profile",
      subtitle: "linkedin.com/in/abhayv175/",
      category: "Social",
      icon: <FiExternalLink className="text-blue-500" />,
      keywords: ["linkedin", "profile", "connect"],
      action: () => {
        window.open(
          "https://www.linkedin.com/in/abhayv175/",
          "_blank",
          "noopener,noreferrer"
        );
        setIsOpen(false);
      },
    },
    {
      id: "soc-leetcode",
      title: "Open LeetCode Profile",
      subtitle: "leetcode.com/u/abhayv175/",
      category: "Social",
      icon: <FiExternalLink className="text-orange-400" />,
      keywords: ["leetcode", "dsa", "algorithms", "problems"],
      action: () => {
        window.open("https://leetcode.com/u/abhayv175/", "_blank", "noopener,noreferrer");
        setIsOpen(false);
      },
    },
  ];

  // Filter commands by search query
  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = cmd.title.toLowerCase().includes(q);
    const subMatch = cmd.subtitle?.toLowerCase().includes(q);
    const catMatch = cmd.category.toLowerCase().includes(q);
    const keyMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
    return titleMatch || subMatch || catMatch || keyMatch;
  });

  // Global Keyboard Shortcut: ⌘K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Open on '/' if user is not currently in an input/textarea
      if (
        e.key === "/" &&
        !isOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Keyboard navigation when palette is open
      if (isOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOpen(false);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating ⌘K Quick Button (Bottom Right - Desktop Only) */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0.95, delay: 0.45, ease: [0.22, 0.61, 0.36, 1] },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        aria-label="Open command palette"
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1.25rem+env(safe-area-inset-right,0px))] sm:bottom-6 sm:right-6 z-[9990] hidden sm:flex items-center gap-2 px-4 py-2.5 sm:px-3.5 sm:py-2 rounded-full bg-white/50 dark:bg-zinc-950/80 backdrop-blur-xl border border-black/10 dark:border-white/15 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-lg hover:shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-indigo-500/40 dark:hover:border-indigo-400/40 transition-all duration-200 cursor-pointer group"
      >
        <FiCommand className="text-sm text-indigo-500 transition-transform duration-300 group-hover:rotate-12" />
        <span className="hidden sm:inline">Commands</span>
        <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[0.65rem] font-mono text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/10">
          ⌘K
        </kbd>
      </motion.button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-24 px-3 sm:px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -12 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-full max-w-xl rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-black/10 dark:border-white/15 shadow-2xl backdrop-blur-2xl overflow-hidden z-10 flex flex-col max-h-[80vh] sm:max-h-[75vh]"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-black/10 dark:border-white/10">
                <FiSearch className="text-lg text-zinc-400 shrink-0" />
                <input
                  ref={inputRef}
                  id="command-palette-search"
                  name="commandSearch"
                  aria-label="Search commands"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none"
                />
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[0.65rem] font-mono text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/10">
                  ESC
                </kbd>
              </div>

              {/* Command List Results */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredCommands.length === 0 ? (
                  <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No matching commands found.
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => cmd.action()}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "hover:bg-black/5 dark:hover:bg-white/5 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-base shrink-0">{cmd.icon}</span>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${
                                isSelected ? "text-white" : ""
                              }`}
                            >
                              {cmd.title}
                            </p>
                            {cmd.subtitle && (
                              <p
                                className={`text-xs truncate ${
                                  isSelected
                                    ? "text-indigo-100"
                                    : "text-zinc-500 dark:text-zinc-400"
                                }`}
                              >
                                {cmd.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span
                            className={`text-[0.68rem] px-2 py-0.5 rounded-full font-medium ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {cmd.category}
                          </span>
                          {isSelected && (
                            <FiCornerDownLeft className="text-xs text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Keyboard Navigation Legend */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-[0.72rem] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="font-mono font-semibold">↑↓</kbd> Navigate
                  </span>
                  <span>
                    <kbd className="font-mono font-semibold">↵</kbd> Select
                  </span>
                  <span>
                    <kbd className="font-mono font-semibold">esc</kbd> Close
                  </span>
                </div>
                <span className="hidden sm:inline">Press / anytime to open</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
