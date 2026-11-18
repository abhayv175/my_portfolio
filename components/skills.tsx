"use client";

import React, { useRef } from "react";
import SectionHeading from "./section-heading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { motion, useInView } from "framer-motion";

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

export default function Skills() {
  const { ref: sectionRef } = useSectionInView("Skills", 0.3);
  const motionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(motionRef, {
    once: false,
    margin: "-80px 0px -80px 0px",
  });

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
    >
      <div ref={motionRef} className="w-full">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <SectionHeading>My skills</SectionHeading>
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-lg text-gray-800">
            {skillsData.map((skill, index) => (
              <motion.li
                key={index}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className="list-none bg-white/70 rounded-2xl px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base font-medium text-gray-900 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.18)] transition-[background-color,border-color,box-shadow] duration-200 ease-out cursor-default border border-black/10 hover:border-indigo-500/30 dark:bg-zinc-900/40 dark:text-white/90 dark:border-white/10 dark:hover:border-indigo-400/40 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_24px_-4px_rgba(99,102,241,0.2)] dark:backdrop-blur-md dark:hover:bg-indigo-950/30 hover:bg-indigo-50/60 backdrop-blur-md relative hover:z-10 transform-gpu will-change-transform backface-hidden [backface-visibility:hidden] [transform-style:preserve-3d]"
              >
                {skill}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
