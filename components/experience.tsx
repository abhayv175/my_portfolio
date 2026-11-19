"use client";

import React from "react";
import { createPortal } from "react-dom";
import SectionHeading from "./section-heading";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experiencesData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FiX, FiMapPin, FiCalendar } from "react-icons/fi";

const cardVariants = {
  hidden: {
    scale: 0.75,
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const EXPERIENCE_THEMES = [
  {
    // Marquistech - 4G Modems & Protocols
    accentGradient: "from-sky-500/30 via-cyan-500/20 to-transparent",
    borderFocus: "rgba(56, 189, 248, 0.6)",
    shadowFocus: "0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(56, 189, 248, 0.25)",
    textFocus: "text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
    iconBorder: "rgba(56, 189, 248, 0.5)",
    modalBorder: "border-sky-500/40 dark:border-sky-400/50",
    modalShadow: "shadow-[0_25px_60px_rgba(0,0,0,0.12),0_0_40px_rgba(56,189,248,0.22)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_45px_rgba(56,189,248,0.25)]",
  },
  {
    // Unity - Engine, Physics & Regression
    accentGradient: "from-purple-500/30 via-violet-500/20 to-transparent",
    borderFocus: "rgba(168, 85, 247, 0.6)",
    shadowFocus: "0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(168, 85, 247, 0.25)",
    textFocus: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
    iconBorder: "rgba(168, 85, 247, 0.5)",
    modalBorder: "border-purple-500/40 dark:border-purple-400/50",
    modalShadow: "shadow-[0_25px_60px_rgba(0,0,0,0.12),0_0_40px_rgba(168,85,247,0.22)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_45px_rgba(168,85,247,0.25)]",
  },
  {
    // UAB First Riddle - Full Stack Web & Data
    accentGradient: "from-emerald-500/30 via-teal-500/20 to-transparent",
    borderFocus: "rgba(16, 185, 129, 0.6)",
    shadowFocus: "0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(16, 185, 129, 0.25)",
    textFocus: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    iconBorder: "rgba(16, 185, 129, 0.5)",
    modalBorder: "border-emerald-500/40 dark:border-emerald-400/50",
    modalShadow: "shadow-[0_25px_60px_rgba(0,0,0,0.12),0_0_40px_rgba(16,185,129,0.22)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_45px_rgba(16,185,129,0.25)]",
  },
  {
    // Infowiz - Software Development Intern
    accentGradient: "from-amber-500/30 via-orange-500/20 to-transparent",
    borderFocus: "rgba(245, 158, 11, 0.6)",
    shadowFocus: "0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(245, 158, 11, 0.25)",
    textFocus: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    iconBorder: "rgba(245, 158, 11, 0.5)",
    modalBorder: "border-amber-500/40 dark:border-amber-400/50",
    modalShadow: "shadow-[0_25px_60px_rgba(0,0,0,0.12),0_0_40px_rgba(245,158,11,0.22)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_45px_rgba(245,158,11,0.25)]",
  },
];

interface ExperienceTimelineCardProps {
  item: (typeof experiencesData)[number];
  index: number;
  theme: string;
  isMobile: boolean;
  activeIndex: number | null;
  setActiveIndex: (index: number) => void;
}

function ExperienceTimelineCard({
  item,
  index,
  theme,
  isMobile,
  activeIndex,
  setActiveIndex,
}: ExperienceTimelineCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isInScroll = useInView(cardRef, {
    once: false,
    margin: "-80px 0px -80px 0px",
  });
  const [isInView, setIsInView] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const isCardFocused = isMobile ? isInView : isHovered;
  const itemTheme = EXPERIENCE_THEMES[index % EXPERIENCE_THEMES.length];

  React.useEffect(() => {
    const el = cardRef.current?.querySelector<HTMLElement>(
      ".vertical-timeline-element-content"
    );
    if (!el) return;
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`experience-card-wrapper w-full pointer-events-none transition-all duration-300 ${
        index === 0
          ? "mb-14 sm:mb-16 min-[1170px]:mb-0"
          : index === 1
          ? "mb-14 sm:mb-16 min-[1170px]:mb-0 timeline-stagger-1"
          : index === 2
          ? "mb-14 sm:mb-16 min-[1170px]:mb-0 timeline-stagger-2"
          : "mb-14 sm:mb-16 min-[1170px]:mb-0 timeline-stagger-3"
      }`}
    >
      <motion.div
        initial="hidden"
        animate={isInScroll ? "visible" : "hidden"}
        variants={cardVariants}
        viewport={
          isMobile
            ? { margin: "-25% 0px -25% 0px", amount: 0.2, once: false }
            : undefined
        }
        onViewportEnter={() => {
          if (isMobile) setIsInView(true);
        }}
        onViewportLeave={() => {
          if (isMobile) setIsInView(false);
        }}
        style={{
          transform: "translateZ(0)",
          WebkitTapHighlightColor: "transparent",
        }}
        className="w-full pointer-events-none transform-gpu will-change-transform [-webkit-tap-highlight-color:transparent]"
      >
      <VerticalTimelineElement
        position={index % 2 === 0 ? "left" : "right"}
        onTimelineElementClick={() => setActiveIndex(index)}
        textClassName="cursor-pointer group/card transition-all duration-300 ease-out transform-gpu will-change-transform select-none [-webkit-tap-highlight-color:transparent] relative overflow-hidden pointer-events-auto"
        contentStyle={{
          zIndex: isCardFocused ? 30 : 2,
          background: isCardFocused
            ? theme === "light"
              ? "rgba(255, 255, 255, 0.95)"
              : "rgba(15, 23, 42, 0.85)"
            : theme === "light"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: isCardFocused
            ? itemTheme.shadowFocus
            : theme === "light"
              ? "0 4px 20px -2px rgba(0, 0, 0, 0.08)"
              : "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
          border: isCardFocused
            ? `1.5px solid ${itemTheme.borderFocus}`
            : theme === "light"
              ? "1px solid rgba(0, 0, 0, 0.10)"
              : "1px solid rgba(255, 255, 255, 0.10)",
          transform: isCardFocused ? "scale(1.03) translateY(-4px)" : "scale(1)",
          transformOrigin: isMobile ? "left center" : "center center",
          textAlign: "left",
          padding: "1.5rem 2rem",
          borderRadius: "1.25rem",
          opacity: activeIndex === index ? 0.35 : isCardFocused ? 1 : 0.75,
          cursor: "pointer",
          transition:
            "transform 250ms ease-out, background-color 250ms ease-out, border-color 250ms ease-out, box-shadow 250ms ease-out, opacity 250ms ease-out",
        }}
        contentArrowStyle={{
          borderRight: isCardFocused
            ? `0.4rem solid ${itemTheme.borderFocus}`
            : theme === "light"
              ? "0.4rem solid rgba(0, 0, 0, 0.10)"
              : "0.4rem solid rgba(255, 255, 255, 0.10)",
        }}
        date={item.date}
        icon={item.icon}
        iconOnClick={() => setActiveIndex(index)}
        iconClassName="cursor-pointer md:hover:scale-110 transition-transform duration-300 [-webkit-tap-highlight-color:transparent]"
        iconStyle={{
          background:
            theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(24, 24, 27, 0.9)",
          border: `2px solid ${isCardFocused ? itemTheme.iconBorder : theme === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.15)"}`,
          color: theme === "light" ? "#1e293b" : "#f8fafc",
          fontSize: "1.5rem",
          boxShadow: isCardFocused
            ? itemTheme.shadowFocus
            : theme === "light"
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              : "0 4px 12px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          cursor: "pointer",
        }}
      >
        {/* Colorful Gradient Sheen On Hover & Enlargement (Matching Skills Container) */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${itemTheme.accentGradient} ${
            isCardFocused ? "opacity-100" : "opacity-0"
          } group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none`}
        />

        <div
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={activeIndex === index}
          aria-label={`View details for ${item.title} at ${item.company}`}
          className="relative z-10 cursor-pointer select-none [-webkit-tap-highlight-color:transparent] pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setActiveIndex(index)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveIndex(index);
            }
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`text-xl font-bold tracking-tight capitalize transition-colors duration-200 ${
                isCardFocused
                  ? itemTheme.textFocus
                  : "text-gray-900 dark:text-white group-hover/card:text-gray-950 dark:group-hover/card:text-white"
              }`}
            >
              {item.title}
            </h3>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1">
              <span>Expand</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 !mt-0.5">
            <p className="font-semibold text-gray-800 dark:text-white/90 text-sm sm:text-base">
              {item.company}
            </p>
            <span
              className={`text-[0.68rem] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border ${itemTheme.badge}`}
            >
              {item.date}
            </span>
          </div>
          <p className="font-normal text-gray-500 dark:text-white/60 !mt-0 text-xs sm:text-sm">
            {item.location}
          </p>

          <p className="!mt-2 font-normal leading-relaxed text-sm sm:text-base text-gray-700 dark:text-white/90">
            {item.description}
          </p>
        </div>
      </VerticalTimelineElement>
    </motion.div>
  </div>
  );
}

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.2);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1170);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setActiveIndex(null);
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
  }, [activeIndex]);

  return (
    <section
      id="experience"
      ref={ref}
      className="scroll-mt-28 mb-24 sm:mb-32 w-full max-w-xl md:max-w-6xl mx-auto px-0 sm:px-4 md:px-0"
    >
      <style>{`
        #experience .vertical-timeline-element-content {
          transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease-in-out, border-color 300ms ease-in-out, box-shadow 300ms ease-in-out, opacity 300ms ease-in-out !important;
        }
        #experience .vertical-timeline-element {
          pointer-events: none;
        }
        #experience .vertical-timeline-element-content,
        #experience .vertical-timeline-element-icon {
          pointer-events: auto;
        }
        #experience .vertical-timeline-element-date {
          display: none !important;
        }
        @media only screen and (max-width: 1169px) {
          #experience .vertical-timeline-element {
            margin: 1.5rem 0 3rem 0 !important;
          }
          #experience .experience-card-wrapper {
            margin-bottom: 3.5rem !important;
          }
          #experience .experience-card-wrapper:last-child {
            margin-bottom: 1rem !important;
          }
        }
        @media only screen and (min-width: 1170px) {
          #experience .vertical-timeline-element {
            margin: 0 !important;
          }
          #experience .timeline-stagger-1 {
            margin-top: -190px !important;
          }
          #experience .timeline-stagger-2 {
            margin-top: -70px !important;
          }
          #experience .timeline-stagger-3 {
            margin-top: -160px !important;
          }
        }
        @media (max-width: 640px) {
          #experience .vertical-timeline-element-content {
            padding: 1.25rem 1.25rem !important;
          }
        }
      `}</style>
      <div className="flex justify-center mb-2">
        <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-sm">
          Experience
        </span>
      </div>
      <SectionHeading>Experience</SectionHeading>
      {mounted ? (
        <VerticalTimeline
          animate={false}
          lineColor={theme === "light" ? "#d1d5db" : "rgba(255, 255, 255, 0.35)"}
          className="!space-y-0 !p-0"
        >
          {experiencesData.map((item, index) => (
            <ExperienceTimelineCard
              key={index}
              item={item}
              index={index}
              theme={theme}
              isMobile={isMobile}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </VerticalTimeline>
      ) : null}

      {/* Interactive Click-to-Expand Modal (Portaled to document.body for true viewport centering) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeIndex !== null && experiencesData[activeIndex] && (
              <motion.div
                key="experience-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveIndex(null)}
                className="fixed inset-0 z-[10000] bg-slate-900/25 dark:bg-black/70 backdrop-blur-md cursor-pointer touch-none overscroll-none"
                aria-label="Close modal overlay"
              />
            )}

            {activeIndex !== null && experiencesData[activeIndex] && (
              <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
                <motion.div
                  key={`experience-card-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 12 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="experience-modal-title"
                  className={`pointer-events-auto w-[94vw] sm:w-[92vw] max-w-lg md:max-w-2xl max-h-[88vh] sm:max-h-[85vh] overflow-y-auto p-5 sm:p-8 md:p-10 flex flex-col justify-start relative bg-white/85 dark:bg-zinc-900/90 backdrop-blur-2xl border ${
                    EXPERIENCE_THEMES[activeIndex % EXPERIENCE_THEMES.length].modalBorder
                  } ${
                    EXPERIENCE_THEMES[activeIndex % EXPERIENCE_THEMES.length].modalShadow
                  } rounded-3xl overflow-hidden text-left select-none`}
                >
                  {/* Dynamic Themed Ambient Corner Glow */}
                  <div
                    className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl ${
                      EXPERIENCE_THEMES[activeIndex % EXPERIENCE_THEMES.length].accentGradient
                    } rounded-full blur-3xl pointer-events-none opacity-90 dark:opacity-80`}
                  />
                  <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${
                      EXPERIENCE_THEMES[activeIndex % EXPERIENCE_THEMES.length].accentGradient
                    } pointer-events-none opacity-40 dark:opacity-25`}
                  />

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setActiveIndex(null)}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all flex items-center justify-center text-gray-700 dark:text-zinc-300 hover:text-gray-950 dark:hover:text-white hover:scale-110 active:scale-95 border border-black/10 dark:border-white/10 z-20 cursor-pointer"
                    aria-label="Close experience details"
                  >
                    <FiX className="text-base" />
                  </button>

                  {/* Header with Icon, Company Pill, and Title */}
                  <div className="flex items-start gap-3.5 sm:gap-5 mb-5 pr-8 relative z-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/10 shadow-sm text-gray-950 dark:text-white">
                      {experiencesData[activeIndex].icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            EXPERIENCE_THEMES[activeIndex % EXPERIENCE_THEMES.length].badge
                          }`}
                        >
                          {experiencesData[activeIndex].company}
                        </span>
                      </div>
                      <h3
                        id="experience-modal-title"
                        className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white"
                      >
                        {experiencesData[activeIndex].title}
                      </h3>
                    </div>
                  </div>

                  {/* Location & Date Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-6 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/5 text-gray-800 dark:text-zinc-200 border border-black/10 dark:border-white/10">
                      <FiMapPin className="text-xs opacity-70 shrink-0" />
                      <span>{experiencesData[activeIndex].location}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/5 text-gray-800 dark:text-zinc-200 border border-black/10 dark:border-white/10">
                      <FiCalendar className="text-xs opacity-70 shrink-0" />
                      <span>{experiencesData[activeIndex].date}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-zinc-300 font-normal mb-6 relative z-10">
                    {experiencesData[activeIndex].description}
                  </p>

                  {/* Footer dismiss hint */}
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-gray-600 dark:text-zinc-400 relative z-10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                      <span>Click card or outside to close</span>
                    </span>
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[0.68rem] font-mono font-medium rounded-md bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300">
                      ESC to close
                    </kbd>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
