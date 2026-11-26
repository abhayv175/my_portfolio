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
      className="relative isolate mb-24 max-w-[46rem] text-center sm:mb-32 scroll-mt-24 sm:scroll-mt-28 px-4 sm:px-0"
    >
      {/* Cardless radial washes in Light & Dark Modes so copy stays crisp over ring arcs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_90%_78%_at_48%_55%,rgba(255,255,255,0.72),rgba(255,255,255,0.34)_58%,transparent_88%)] blur-xl opacity-100 dark:opacity-0 transition-opacity duration-500 ease-out"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_90%_78%_at_48%_55%,rgba(4,4,8,0.68),rgba(4,4,8,0.28)_58%,transparent_88%)] blur-xl opacity-0 dark:opacity-100 transition-opacity duration-500 ease-out"
      />
      <div ref={motionRef} className="w-full">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <div className="flex justify-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-cyan-500/15 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 dark:border-cyan-500/20 shadow-sm backdrop-blur-sm">
              About Me
            </span>
          </div>
          <SectionHeading>About me</SectionHeading>

          <p className="mb-5 leading-relaxed font-normal text-base sm:text-lg md:text-xl text-gray-950 dark:text-white/90 text-pretty drop-shadow-[0_1px_12px_rgba(250,250,250,0.98)] dark:drop-shadow-[0_1px_12px_rgba(4,4,8,0.95)]">
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

          <p className="text-base sm:text-lg leading-relaxed text-gray-900 dark:text-gray-200 font-normal drop-shadow-[0_1px_12px_rgba(250,250,250,0.98)] dark:drop-shadow-[0_1px_12px_rgba(4,4,8,0.98)]">
            When I&apos;m not coding, I enjoy reading about philosophy,
            history, and geopolitics.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

