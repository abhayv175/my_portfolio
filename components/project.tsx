"use client";

import React, { useRef } from "react";
import { projectsData } from "@/lib/data";
import Image from "next/image";
import { motion } from "framer-motion";

type ProjectProps = (typeof projectsData)[number] & {
  url: string;
  index?: number;
};

// Smooth critically-damped spring physics (zeta = 1.0, zero overshoot, fluid 60fps)
const springTransition = {
  type: "spring" as const,
  stiffness: 180,
  damping: 24,
  mass: 0.8,
};

const cardVariants = {
  hidden: {
    scale: 0.88,
    opacity: 0,
    y: 35,
    transition: springTransition,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    scale: 0.88,
    opacity: 0,
    y: 35,
    transition: springTransition,
  },
};

export default function Project({
  title,
  description,
  tags,
  imageUrl,
  url,
}: ProjectProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{
        amount: 0.4,
        margin: "-10% 0px -10% 0px",
        once: false,
      }}
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      className="group my-6 sm:my-8 py-2 w-full max-w-[42rem] flex justify-center relative transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] outline outline-1 outline-transparent"
    >
      {/* Layer 1: Outer Hit-Box Wrapper - Static layout box, never shifts layout */}
      <div className="group/card relative z-10 hover:z-50 w-full py-3">
        {/* Full-card link hit-box matching the exact static card boundaries */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${title} project`}
          className="absolute inset-0 z-20 w-full h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-3xl"
        />

        {/* Layer 2: Inner Visual Card - Scales on hover with hardware acceleration and symmetric easing */}
        <div
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            outline: "1px solid transparent",
            transition:
              "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 450ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          className="w-full origin-center pointer-events-none transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] transition-[transform,opacity,box-shadow] duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover/list:opacity-40 group-hover/list:scale-95 group-hover/card:!opacity-100 group-hover/card:!scale-[1.03] sm:group-hover/card:!scale-105 md:group-hover/card:!scale-[1.3] group-focus-within/card:!opacity-100 group-focus-within/card:!scale-[1.03] sm:group-focus-within/card:!scale-105 md:group-focus-within/card:!scale-[1.3] outline outline-1 outline-transparent"
        >
          <section
            style={{
              contain: "paint",
              isolation: "isolate",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              outline: "1px solid transparent",
              transition:
                "background-color 450ms cubic-bezier(0.22, 1, 0.36, 1), border-color 450ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 450ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="bg-transparent max-w-[42rem] border border-black/10 group-hover/card:border-black/25 rounded-3xl overflow-hidden relative sm:h-[20rem] group-hover/card:bg-black/[0.035] transition-[background-color,border-color,box-shadow] duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:pr-8 sm:group-even:pl-8 dark:text-white dark:bg-white/5 dark:group-hover/card:bg-white/[0.12] dark:border-white/15 dark:group-hover/card:border-white/35 backdrop-blur-[16px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] group-hover/card:shadow-[0_25px_60px_rgba(0,0,0,0.35)] dark:group-hover/card:shadow-[0_25px_60px_rgba(0,0,0,0.7)] transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] isolate outline outline-1 outline-transparent"
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
              <h3 className="text-2xl font-bold tracking-tight leading-snug text-gray-900 dark:text-white">
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
              className="absolute hidden sm:block top-8 -right-40 w-[28.25rem] transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d] transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
              group-hover/card:scale-[1.04]
              group-hover/card:-translate-x-3
              group-hover/card:translate-y-3
              group-hover/card:-rotate-2

              group-even:group-hover/card:translate-x-3
              group-even:group-hover/card:translate-y-3
              group-even:group-hover/card:rotate-2

              group-even:right-[initial] group-even:-left-40 pointer-events-none select-none"
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
        </div>
      </div>
    </motion.div>
  );
}
