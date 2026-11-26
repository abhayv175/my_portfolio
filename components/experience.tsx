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
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { FiX, FiMapPin, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { SURFACE, SURFACE_RGBA } from "./surface-styles";

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
    dotClass: "bg-sky-500 dark:bg-sky-400",
  },
  {
    // Unity - Engine, Physics & Regression
    accentGradient: "from-purple-500/30 via-violet-500/20 to-transparent",
    borderFocus: "rgba(168, 85, 247, 0.6)",
    shadowFocus: "0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(168, 85, 247, 0.25)",
    textFocus: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25",
    iconBorder: "rgba(168, 85, 247, 0.5)",
    dotClass: "bg-purple-500 dark:bg-purple-400",
  },
  {
    // UAB First Riddle - Full Stack Web & Data
    accentGradient: "from-emerald-500/30 via-teal-500/20 to-transparent",
    borderFocus: "rgba(16, 185, 129, 0.6)",
    shadowFocus: "0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(16, 185, 129, 0.25)",
    textFocus: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    iconBorder: "rgba(16, 185, 129, 0.5)",
    dotClass: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    // Infowiz - Software Development Intern
    accentGradient: "from-amber-500/30 via-orange-500/20 to-transparent",
    borderFocus: "rgba(245, 158, 11, 0.6)",
    shadowFocus: "0 16px 40px rgba(0,0,0,0.3), 0 0 30px rgba(245, 158, 11, 0.25)",
    textFocus: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    iconBorder: "rgba(245, 158, 11, 0.5)",
    dotClass: "bg-amber-500 dark:bg-amber-400",
  },
];

type OriginOffset = {
  x: number;
  y: number;
};

function measureOriginOffset(sourceEl?: HTMLElement | null): OriginOffset {
  if (!sourceEl || typeof window === "undefined") {
    return { x: 0, y: 20 };
  }
  const rect = sourceEl.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - window.innerWidth / 2;
  const dy = rect.top + rect.height / 2 - window.innerHeight / 2;
  return {
    x: Math.max(-220, Math.min(220, dx * 0.35)),
    y: Math.max(-180, Math.min(180, dy * 0.35)),
  };
}

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts || parts.length <= 1) return [text];
  return parts.map((sentence) => sentence.trim()).filter(Boolean);
}

interface ExperienceTimelineCardProps {
  item: (typeof experiencesData)[number];
  index: number;
  theme: string;
  isMobile: boolean;
  activeIndex: number | null;
  onSelect: (index: number, sourceEl?: HTMLElement | null) => void;
}

function ExperienceTimelineCard({
  item,
  index,
  theme,
  isMobile,
  activeIndex,
  onSelect,
}: ExperienceTimelineCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isInScroll = useInView(cardRef, {
    once: true,
    amount: 0.05,
  });
  const isMobileInCenter = useInView(cardRef, {
    margin: "-25% 0px -25% 0px",
    amount: 0.2,
    once: false,
  });
  const [isHovered, setIsHovered] = React.useState(false);

  const isCardFocused = isMobile ? isMobileInCenter : isHovered;
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

  const getCardContentEl = () =>
    cardRef.current?.querySelector<HTMLElement>(
      ".vertical-timeline-element-content"
    );

  const handleOpen = () => onSelect(index, getCardContentEl());

  return (
    <div
      ref={cardRef}
      className={`experience-card-wrapper w-full pointer-events-none transition-opacity duration-300 ${
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
        style={{
          transform: "translateZ(0)",
          WebkitTapHighlightColor: "transparent",
        }}
        className="w-full pointer-events-none transform-gpu will-change-transform [-webkit-tap-highlight-color:transparent]"
      >
      <VerticalTimelineElement
        position={index % 2 === 0 ? "left" : "right"}
        onTimelineElementClick={handleOpen}
        textClassName="cursor-pointer group/card transform-gpu will-change-transform select-none [-webkit-tap-highlight-color:transparent] relative overflow-hidden pointer-events-auto"
        contentStyle={{
          zIndex: isCardFocused ? 30 : 2,
          background: isMobile
            ? isMobileInCenter
              ? SURFACE_RGBA.cardFocus[theme === "light" ? "light" : "dark"]
              : SURFACE_RGBA.cardRest[theme === "light" ? "light" : "dark"]
            : isHovered
              ? SURFACE_RGBA.cardHover[theme === "light" ? "light" : "dark"]
              : SURFACE_RGBA.cardRest[theme === "light" ? "light" : "dark"],
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
          opacity: activeIndex === index ? 0.35 : 1,
          cursor: "pointer",
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
        iconOnClick={handleOpen}
        iconClassName="cursor-pointer md:hover:scale-110 transition-transform duration-300 [-webkit-tap-highlight-color:transparent]"
        iconStyle={{
          background:
            SURFACE_RGBA.iconCircle[theme === "light" ? "light" : "dark"],
          border: `2px solid ${isCardFocused ? itemTheme.iconBorder : theme === "light" ? "rgba(0, 0, 0, 0.10)" : "rgba(255, 255, 255, 0.15)"}`,
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
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpen();
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
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [originOffset, setOriginOffset] = React.useState<OriginOffset>({
    x: 0,
    y: 20,
  });

  const handleOpenExperience = React.useCallback(
    (index: number, sourceEl?: HTMLElement | null) => {
      setOriginOffset(measureOriginOffset(sourceEl));
      setActiveIndex(index);
    },
    []
  );

  const handleStepExperience = React.useCallback((delta: number) => {
    setActiveIndex((prev) => {
      if (prev === null) return prev;
      return (prev + delta + experiencesData.length) % experiencesData.length;
    });
  }, []);

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
    if (activeIndex === null) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIndex(null);
      } else if (e.key === "ArrowRight") {
        handleStepExperience(1);
      } else if (e.key === "ArrowLeft") {
        handleStepExperience(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, lenis, handleStepExperience]);

  const activeItem =
    activeIndex !== null ? experiencesData[activeIndex] : undefined;
  const activeTheme =
    activeIndex !== null
      ? EXPERIENCE_THEMES[activeIndex % EXPERIENCE_THEMES.length]
      : EXPERIENCE_THEMES[0];
  const activeSentences = activeItem ? splitSentences(activeItem.description) : [];

  return (
    <section
      id="experience"
      ref={ref}
      className="scroll-mt-28 mb-24 sm:mb-32 w-full max-w-xl md:max-w-6xl mx-auto px-0 sm:px-4 md:px-0"
    >
      <style>{`
        #experience .vertical-timeline-element-content {
          transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), background-color 520ms cubic-bezier(0.22, 1, 0.36, 1), border-color 520ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 520ms cubic-bezier(0.22, 1, 0.36, 1), color 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease-out !important;
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
              onSelect={handleOpenExperience}
            />
          ))}
        </VerticalTimeline>
      ) : null}

      {/* Focused Fullscreen Work Experience Overlay (Frosted Glass Design Language) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeIndex !== null && activeItem && (
              <div
                key="experience-overlay-root"
                className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 md:p-10"
              >
                {/* Frosted Scrim */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveIndex(null)}
                  className="fixed inset-0 bg-white/60 dark:bg-[#040408]/75 backdrop-blur-md cursor-pointer touch-none overscroll-none"
                  aria-label="Close modal overlay"
                />

                {/* Fullscreen / Expanded Glass Showcase Container */}
                <motion.div
                  initial={
                    reducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          x: originOffset.x,
                          y: originOffset.y,
                          scale: 0.92,
                        }
                  }
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          x: originOffset.x * 0.55,
                          y: originOffset.y * 0.55,
                          scale: 0.94,
                        }
                  }
                  transition={{
                    duration: reducedMotion ? 0.16 : 0.34,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="experience-modal-title"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                  className="relative z-10 w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(86dvh,44rem)] flex flex-col rounded-[1.75rem] sm:rounded-[2rem] bg-white/88 dark:bg-[#090910]/86 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_32px_96px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden text-left transform-gpu will-change-[transform,opacity]"
                >
                  {/* Top Specular Edge Hairline (Matches Header Pill Aesthetic) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-black/15 dark:via-white/25 to-transparent"
                  />

                  {/* Subtle Radial Depth Wash */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.03),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.045),transparent_60%)]"
                  />

                  {/* Modal Header */}
                  <div className="relative z-10 flex items-start justify-between gap-4 px-5 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-black/[0.08] dark:border-white/[0.09]">
                    <div className="flex items-start gap-3.5 sm:gap-5 min-w-0">
                      <div
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl shrink-0 flex items-center justify-center text-xl sm:text-2xl ${SURFACE.inset} text-zinc-900 dark:text-white shadow-sm`}
                      >
                        {activeItem.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                            Work Experience ·{" "}
                            {String(activeIndex + 1).padStart(2, "0")} /{" "}
                            {String(experiencesData.length).padStart(2, "0")}
                          </span>
                        </div>

                        <h3
                          id="experience-modal-title"
                          className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white leading-tight"
                        >
                          {activeItem.title}
                        </h3>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${SURFACE.inset} text-zinc-900 dark:text-zinc-100`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${activeTheme.dotClass}`}
                            />
                            <span>{activeItem.company}</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${SURFACE.inset} text-zinc-700 dark:text-zinc-300`}
                          >
                            <FiMapPin className="text-xs opacity-70 shrink-0" />
                            <span>{activeItem.location}</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${SURFACE.inset} text-zinc-700 dark:text-zinc-300`}
                          >
                            <FiCalendar className="text-xs opacity-70 shrink-0" />
                            <span>{activeItem.date}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveIndex(null)}
                      className={`w-9 h-9 rounded-full shrink-0 ${SURFACE.insetInteractive} transition-transform duration-200 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:scale-105 active:scale-95 cursor-pointer`}
                      aria-label="Close experience details"
                    >
                      <FiX className="text-base" />
                    </button>
                  </div>

                  {/* Scrollable Editorial Body */}
                  <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-8 py-5 sm:py-7">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeIndex}
                        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                        transition={{
                          duration: 0.18,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="space-y-4"
                      >
                        {activeSentences.map((sentence, sentenceIdx) => (
                          <p
                            key={sentenceIdx}
                            className="text-[0.95rem] sm:text-[1.05rem] leading-[1.75] text-zinc-700 dark:text-zinc-300 font-normal"
                          >
                            {sentence}
                          </p>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Footer Controls (Matches Command Palette Bar & Website Pill Buttons) */}
                  <div className="relative z-10 flex items-center justify-between gap-3 px-5 sm:px-8 py-3.5 sm:py-4 border-t border-black/[0.08] dark:border-white/[0.09] bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStepExperience(-1)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${SURFACE.insetInteractive} text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer`}
                        aria-label="Previous experience"
                      >
                        <FiChevronLeft className="text-sm" />
                        <span>Prev</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepExperience(1)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${SURFACE.insetInteractive} text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer`}
                        aria-label="Next experience"
                      >
                        <span>Next</span>
                        <FiChevronRight className="text-sm" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="hidden sm:inline">
                        <kbd
                          className={`px-1.5 py-0.5 mr-1 rounded font-mono text-[0.68rem] ${SURFACE.inset} text-zinc-700 dark:text-zinc-300`}
                        >
                          ← →
                        </kbd>
                        Switch
                      </span>
                      <span className="hidden sm:inline">
                        <kbd
                          className={`px-1.5 py-0.5 mr-1 rounded font-mono text-[0.68rem] ${SURFACE.inset} text-zinc-700 dark:text-zinc-300`}
                        >
                          ESC
                        </kbd>
                        Close
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveIndex(null)}
                        className="sm:hidden inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
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
