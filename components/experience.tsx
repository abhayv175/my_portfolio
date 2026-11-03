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
import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function Experience() {
  const { ref } = useSectionInView("Experience", 0.2);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
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
      className="scroll-mt-28 mb-24 sm:mb-32 w-full max-w-xl md:max-w-6xl mx-auto px-4 sm:px-6 md:px-0"
    >
      <style>{`
        #experience .vertical-timeline-element-content {
          transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease-in-out, border-color 300ms ease-in-out, box-shadow 300ms ease-in-out, opacity 300ms ease-in-out !important;
        }
        #experience .vertical-timeline-element {
          margin: 0 !important;
        }
        @media (max-width: 640px) {
          #experience .vertical-timeline-element-content {
            padding: 1.25rem 1.25rem !important;
          }
        }
      `}</style>
      <SectionHeading>My experience</SectionHeading>
      {mounted ? (
        <VerticalTimeline
          animate={false}
          lineColor={theme === "light" ? "#d1d5db" : "rgba(255, 255, 255, 0.35)"}
          className="space-y-12 sm:space-y-16 md:space-y-24"
        >
          {experiencesData.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ once: true, margin: "-40px 0px" }}
              className="mb-12 sm:mb-16 md:mb-24 last:mb-0 w-full"
            >
              <VerticalTimelineElement
                position={index % 2 === 0 ? "left" : "right"}
                onTimelineElementClick={() => setActiveIndex(index)}
                textClassName="cursor-pointer group/card hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform select-none"
                contentStyle={{
                  background:
                    theme === "light" ? "transparent" : "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow:
                    theme === "light"
                      ? "0 4px 20px -2px rgba(0, 0, 0, 0.08)"
                      : "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
                  border:
                    theme === "light"
                      ? "1px solid rgba(0, 0, 0, 0.10)"
                      : "1px solid rgba(255, 255, 255, 0.15)",
                  textAlign: "left",
                  padding: "1.5rem 2rem",
                  borderRadius: "1rem",
                  opacity: activeIndex === index ? 0.35 : 1,
                  cursor: "pointer",
                  transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                contentArrowStyle={{
                  borderRight:
                    theme === "light"
                      ? "0.4rem solid rgba(0, 0, 0, 0.10)"
                      : "0.4rem solid rgba(255, 255, 255, 0.15)",
                }}
                date={item.date}
                icon={item.icon}
                iconOnClick={() => setActiveIndex(index)}
                iconClassName="cursor-pointer hover:scale-110 transition-transform duration-300"
                iconStyle={{
                  background:
                    theme === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(24, 24, 27, 0.85)",
                  border:
                    theme === "light"
                      ? "2px solid rgba(0, 0, 0, 0.08)"
                      : "2px solid rgba(255, 255, 255, 0.15)",
                  color: theme === "light" ? "#1e293b" : "#f8fafc",
                  fontSize: "1.5rem",
                  boxShadow:
                    theme === "light"
                      ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                      : "0 4px 12px rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  cursor: "pointer",
                }}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold tracking-tight capitalize text-gray-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
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
                  <p className="font-medium text-gray-800 dark:text-white/90 !mt-0.5 text-sm sm:text-base">
                    {item.company}
                  </p>
                  <p className="font-normal text-gray-500 dark:text-white/60 !mt-0 text-xs sm:text-sm">
                    {item.location}
                  </p>

                  <p className="!mt-2 font-normal leading-relaxed text-sm sm:text-base text-gray-700 dark:text-white/90">
                    {item.description}
                  </p>
                </div>
              </VerticalTimelineElement>
            </motion.div>
          ))}
        </VerticalTimeline>
      ) : null}

      {/* Interactive Click-to-Expand 3D Modal (Portaled to document.body for true viewport centering) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activeIndex !== null && experiencesData[activeIndex] && (
              <motion.div
                key="experience-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onClick={() => setActiveIndex(null)}
                className="fixed inset-0 z-40 z-[10000] bg-black/40 dark:bg-black/60 backdrop-blur-xl cursor-pointer touch-none overscroll-none"
                aria-label="Close modal overlay"
              />
            )}

            {activeIndex !== null && experiencesData[activeIndex] && (
              <motion.div
                key="experience-modal-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 z-[10001] flex items-center justify-center p-3 sm:p-6 pointer-events-none [perspective:1200px]"
              >
                <motion.div
                  key={`experience-card-${activeIndex}`}
                  style={{
                    transformStyle: "preserve-3d",
                    WebkitBackdropFilter: "blur(64px) saturate(150%)",
                    backdropFilter: "blur(64px) saturate(150%)",
                  }}
                  initial={{ opacity: 0, scale: 0.7, rotateY: -90, y: 40 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotateY: 90, y: 20 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  onClick={() => setActiveIndex(null)}
                  className="pointer-events-auto cursor-pointer w-[92vw] max-w-lg md:w-[50vw] md:max-w-3xl min-h-[40vh] max-h-[85vh] overflow-y-auto p-5 sm:p-8 md:p-12 flex flex-col justify-center relative bg-white/75 dark:bg-slate-900/80 backdrop-blur-3xl backdrop-saturate-150 border border-white/50 dark:border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.45)] rounded-2xl sm:rounded-3xl select-none"
                >
                  {/* Close Button Hint */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(null);
                    }}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Close experience details"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Header with Icon, Title, and Company */}
                  <div className="flex items-start gap-3.5 sm:gap-5 mb-4 sm:mb-6 pr-8">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl border border-white/50 dark:border-white/20 bg-white/80 dark:bg-white/10 shadow-lg text-gray-800 dark:text-white">
                      {experiencesData[activeIndex].icon}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {experiencesData[activeIndex].title}
                      </h3>
                      <p className="font-semibold text-gray-700 dark:text-white/85 text-sm sm:text-base md:text-lg mt-0.5">
                        {experiencesData[activeIndex].company}
                      </p>
                    </div>
                  </div>

                  {/* Location and Date Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[0.7rem] sm:text-xs md:text-sm font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10">
                      <svg
                        className="w-3.5 h-3.5 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {experiencesData[activeIndex].location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[0.7rem] sm:text-xs md:text-sm font-medium bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300 border border-blue-500/20">
                      <svg
                        className="w-3.5 h-3.5 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {experiencesData[activeIndex].date}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                    {experiencesData[activeIndex].description}
                  </p>

                  {/* Footer dismiss hint */}
                  <div className="mt-6 pt-3 sm:mt-8 sm:pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[0.7rem] sm:text-xs text-gray-400 dark:text-gray-500">
                    <span>Click card or outside to close</span>
                    <span className="hidden sm:inline">ESC to close</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
