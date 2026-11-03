"use client";

import React, { useRef } from "react";
import SectionHeading from "./section-heading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import { motion, useInView } from "framer-motion";

const cardVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 30,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

function SkillItem({ skill }: { skill: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, {
    once: false,
    margin: "-80px 0px -80px 0px",
  });

  return (
    <li ref={ref} className="list-none">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        whileHover={{ scale: 1.05 }}
        variants={cardVariants}
        className="bg-transparent rounded-2xl px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base font-semibold text-gray-900 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_28px_-5px_rgba(0,0,0,0.12),0_10px_14px_-6px_rgba(0,0,0,0.08)] hover:scale-105 transition-all duration-300 ease-out cursor-default border border-black/10 hover:border-black/25 dark:bg-white/5 dark:text-white/90 dark:border-white/10 dark:hover:border-white/35 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] dark:backdrop-blur-md dark:hover:bg-white/[0.15] hover:bg-black/[0.03] backdrop-blur-md relative hover:z-10"
      >
        {skill}
      </motion.div>
    </li>
  );
}

export default function Skills() {
  const { ref } = useSectionInView("Skills", 0.4);

  return (
    <section
      id="skills"
      ref={ref}
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
    >
      <SectionHeading>My skills</SectionHeading>
      <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-lg text-gray-800">
        {skillsData.map((skill, index) => (
          <SkillItem key={index} skill={skill} />
        ))}
      </ul>
    </section>
  );
}
