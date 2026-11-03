"use client";

import React, { useRef } from "react";
import { projectsData } from "@/lib/data";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

type ProjectProps = (typeof projectsData)[number] & {
  url: string;
  index?: number;
};

const cardVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 50,
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
  exit: {
    scale: 0.8,
    opacity: 0,
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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: false,
    margin: "-100px 0px -100px 0px",
  });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="group my-6 sm:my-8 py-2 w-full max-w-[42rem] flex justify-center relative"
    >
      {/* Layer 1: Outer Hit-Box Wrapper - Static layout box, never scales on hover */}
      <div className="group/card relative z-10 hover:z-50 w-full py-3">
        {/* Full-card link hit-box matching the exact static card boundaries */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${title} project`}
          className="absolute inset-0 z-20 w-full h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-2xl"
        />

        {/* Layer 2: Inner Visual Card - Scales on hover without hijacking pointer events from siblings */}
        <div
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className="w-full origin-center pointer-events-none transform-gpu transition-[transform,opacity,box-shadow] duration-500 ease-out group-hover/list:opacity-40 group-hover/list:scale-95 group-hover/card:!opacity-100 group-hover/card:!scale-125 md:group-hover/card:!scale-[1.3] group-focus-within/card:!opacity-100 group-focus-within/card:!scale-125 md:group-focus-within/card:!scale-[1.3]"
        >
          <section
            className="bg-transparent max-w-[42rem] border border-black/10 group-hover/card:border-black/25 rounded-2xl overflow-hidden relative sm:h-[20rem] group-hover/card:bg-black/[0.035] transition-[background-color,border-color,box-shadow] duration-500 ease-out sm:pr-8 sm:group-even:pl-8 dark:text-white dark:bg-white/5 dark:group-hover/card:bg-white/[0.12] dark:border-white/15 dark:group-hover/card:border-white/35 backdrop-blur-[16px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] group-hover/card:shadow-[0_25px_60px_rgba(0,0,0,0.35)] dark:group-hover/card:shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
          >
            <Image
              src={imageUrl}
              alt={`${title} preview`}
              quality={80}
              sizes="(max-width: 640px) 100vw, 400px"
              loading="lazy"
              className="block sm:hidden w-full h-48 object-cover object-top"
            />

            <div className="p-6 sm:py-8 sm:px-8 sm:max-w-[54%] flex flex-col h-full sm:group-even:ml-[18rem]">
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

            <Image
              src={imageUrl}
              alt={`${title} preview`}
              quality={80}
              sizes="(max-width: 1024px) 50vw, 452px"
              loading="lazy"
              className="absolute hidden sm:block top-8 -right-40 w-[28.25rem] rounded-t-2xl shadow-2xl
              transition-transform duration-500 ease-out
              group-hover/card:scale-[1.04]
              group-hover/card:-translate-x-3
              group-hover/card:translate-y-3
              group-hover/card:-rotate-2

              group-even:group-hover/card:translate-x-3
              group-even:group-hover/card:translate-y-3
              group-even:group-hover/card:rotate-2

              group-even:right-[initial] group-even:-left-40"
            />
          </section>
        </div>
      </div>
    </motion.div>
  );
}
