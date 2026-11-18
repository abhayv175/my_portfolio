"use client";

import React, { useRef, useState, useEffect } from "react";
import { projectsData } from "@/lib/data";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

type ProjectProps = (typeof projectsData)[number] & {
  url: string;
  index?: number;
};

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

export default function Project({
  title,
  description,
  tags,
  imageUrl,
  url,
}: ProjectProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInScroll = useInView(cardRef, {
    once: false,
    margin: "-80px 0px -80px 0px",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isFocused = isMobile ? isInView : isHovered;

  return (
    <div
      ref={cardRef}
      className="group my-6 sm:my-8 py-2 w-full max-w-[42rem] flex justify-center relative"
    >
      <motion.div
        initial="hidden"
        animate={isInScroll ? "visible" : "hidden"}
        variants={cardVariants}
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        className="w-full flex justify-center relative transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent"
      >
        {/* Outer interactive card container */}
        <div
          onMouseEnter={() => {
            if (!isMobile) setIsHovered(true);
          }}
          onMouseLeave={() => {
            if (!isMobile) setIsHovered(false);
          }}
          onFocus={() => {
            if (!isMobile) setIsHovered(true);
          }}
          onBlur={() => {
            if (!isMobile) setIsHovered(false);
          }}
          className="relative z-10 md:hover:z-50 w-full"
        >
          {/* Visual Card with smooth scale and active focus styles */}
          <motion.div
            viewport={
              isMobile
                ? { margin: "-25% 0px -25% 0px", amount: 0.5, once: false }
                : undefined
            }
            onViewportEnter={() => {
              if (isMobile) setIsInView(true);
            }}
            onViewportLeave={() => {
              if (isMobile) setIsInView(false);
            }}
            style={{
              transform: isFocused ? "scale(1.02)" : "scale(1)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              outline: "1px solid transparent",
              transition:
                "transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className={`w-full origin-center relative rounded-3xl transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent ${
              isFocused ? "opacity-100" : "opacity-70"
            }`}
          >
            {/* Full-card link hit-box matching the exact rounded card boundaries and scaling WITH the card */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${title} project`}
              className="absolute inset-0 z-20 w-full h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-3xl"
            />

            <section
              style={{
                isolation: "isolate",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                outline: "1px solid transparent",
                transition:
                  "background-color 450ms cubic-bezier(0.16, 1, 0.3, 1), border-color 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 450ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              className={`max-w-[42rem] rounded-3xl overflow-hidden relative sm:h-[20rem] backdrop-blur-xl sm:pr-8 sm:group-even:pl-8 transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] isolate outline outline-1 outline-transparent ${
                isFocused
                  ? "border border-white/30 dark:border-sky-400/30 bg-white/[0.08] dark:bg-slate-900/60 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(56,189,248,0.12)]"
                  : "border border-black/10 dark:border-white/10 bg-transparent dark:bg-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]"
              }`}
            >
              {/* Mobile View Mockup Image Wrapper */}
              <div className="block sm:hidden w-full h-48 overflow-hidden rounded-t-3xl transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] relative">
                <Image
                  src={imageUrl}
                  alt={`${title} preview`}
                  quality={80}
                  sizes="(max-width: 640px) 100vw, 400px"
                  loading="lazy"
                  className="w-full h-full object-cover object-top transform-gpu backface-hidden [backface-visibility:hidden]"
                />
              </div>

              {/* Project Content: Text & Tech Stack Badges */}
              <div className="p-5 sm:py-8 sm:px-8 sm:max-w-[54%] flex flex-col h-full sm:group-even:ml-[18rem] relative z-10 transform-gpu backface-hidden [backface-visibility:hidden]">
                <h3
                  className={`text-2xl font-bold tracking-tight leading-snug transition-colors duration-300 ${
                    isFocused
                      ? "text-sky-400 dark:text-sky-400 font-bold"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {title}
                </h3>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-800 dark:text-white/90 font-normal">
                  {description}
                </p>
                <ul className="flex flex-wrap mt-4 gap-2 sm:mt-auto">
                  {tags.map((tag, index) => (
                    <li
                      className="box-border flex-shrink-0 whitespace-nowrap bg-transparent text-gray-900 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider rounded-full border border-black/10 dark:bg-white/5 dark:text-white/90 dark:border-white/10 dark:backdrop-blur-md transition-colors duration-200 ease-in-out hover:bg-black/5 dark:hover:bg-white/15"
                      key={index}
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desktop View Mockup Image Wrapper - Hardware accelerated & isolated */}
              <div
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  outline: "1px solid transparent",
                  transition: "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                className={`absolute hidden sm:block top-8 -right-40 w-[28.25rem] transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] pointer-events-none select-none group-even:right-[initial] group-even:-left-40 ${
                  isFocused
                    ? "scale-[1.04] -translate-x-3 translate-y-3 -rotate-2 group-even:translate-x-3 group-even:translate-y-3 group-even:rotate-2"
                    : "scale-100 translate-x-0 translate-y-0 rotate-0"
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`${title} preview`}
                  quality={80}
                  sizes="(max-width: 1024px) 50vw, 452px"
                  loading="lazy"
                  className="w-full rounded-t-2xl shadow-2xl transform-gpu backface-hidden [backface-visibility:hidden]"
                />
              </div>
            </section>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
