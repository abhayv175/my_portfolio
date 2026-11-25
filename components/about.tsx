 we
"use client";

import React, { useRef } from "react";
import SectionHeading from "./section-heading";
import { motion, useInView } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

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

export default function About() {
  const { ref: sectionRef } = useSectionInView("About", 0.4);
  const motionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(motionRef, {
    once: true,
    amount: 0.05,
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="mb-24 max-w-[46rem] text-center sm:mb-32 scroll-mt-28 px-4 sm:px-0"
    >
      <div ref={motionRef} className="w-full">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <div className="flex justify-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm">
              About Me
            </span>
          </div>
          <SectionHeading>About me</SectionHeading>

          <p className="mb-5 leading-relaxed font-normal text-base sm:text-lg md:text-xl text-gray-800 dark:text-white/90 text-pretty">
            I am a Software Engineer with experience in website and
            application development, software testing, system design,
            database management, and FTP server management. Having worked
            with companies like Unity and Marquistech, I have developed a
            strong foundation in building, testing, debugging, and improving
            software systems. My development experience includes React,
            Next.js, and Dart. I am currently shifting my focus toward
            Artificial Intelligence and Machine Learning, exploring new
            ways to solve complex problems and build smarter applications.
            I enjoy understanding how technology works, from backend
            infrastructure and databases to user-facing applications.
          </p>

          <p className="text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 font-normal">
            When I&apos;m not coding, I enjoy reading about philosophy,
            history, and geopolitics.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

