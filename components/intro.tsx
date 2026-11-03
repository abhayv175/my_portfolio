"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowRight, BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { useTheme } from "@/context/theme-context";

const EMOJIS = ["👋", "🚀", "💻", "⚡", "🎯", "🔥"];

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const { theme } = useTheme();
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNextEmoji = () => {
    setEmojiIndex((prev) => (prev + 1) % EMOJIS.length);
  };

  return (
    <section
      ref={ref}
      id="home"
      className="w-full flex flex-col items-center relative text-center scroll-mt-[100rem] pt-24 sm:pt-28 md:pt-36 pb-0"
    >
      {/* Central Hero Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -15, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-6 sm:mb-8 mt-4 sm:mt-6 z-20"
      >
        <div
          onClick={handleNextEmoji}
          className="group relative cursor-pointer select-none transition-transform duration-500 ease-out hover:scale-105 sm:hover:scale-110 active:scale-95"
          title="Click to change emoji!"
        >
          {/* 3D Perspective Card Container */}
          <div
            style={{ perspective: 1000 }}
            className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
          >
            <motion.div
              initial={false}
              animate={{ rotateY: theme === "dark" ? 180 : 0 }}
              transition={
                mounted
                  ? { duration: 0.6, ease: "easeInOut" }
                  : { duration: 0 }
              }
              style={{
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
              }}
              className="relative w-full h-full transform-gpu"
            >
              {/* Light Mode Face (Front - 0deg) */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className="absolute inset-0 w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-amber-500/40 via-purple-500/40 to-cyan-500/40 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_35px_rgba(192,132,252,0.35)]"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white/95 border-2 border-black/10 shadow-xl backdrop-blur-md">
                  <Image
                    src="/hero_light.png"
                    alt="Abhay Verma portrait"
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                    quality={80}
                    priority={true}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Dark Mode Face (Back - 180deg) */}
              <div
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className="absolute inset-0 w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-amber-400/30 via-purple-500/40 to-cyan-400/30 shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_35px_rgba(192,132,252,0.35)]"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-950 border-2 border-white/20 shadow-xl backdrop-blur-md">
                  <Image
                    src="/hero_dark.png"
                    alt="Abhay Verma portrait"
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                    quality={80}
                    priority={true}
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Greeting Emoji Badge */}
          <div
            className="absolute bottom-0 right-0 sm:bottom-0.5 sm:right-0.5 md:bottom-1 md:right-1 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white dark:bg-zinc-900 border-2 border-black/10 dark:border-white/25 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 z-10"
          >
            <motion.span
              key={emojiIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="text-sm sm:text-base md:text-lg select-none leading-none"
            >
              {EMOJIS[emojiIndex]}
            </motion.span>
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-4 sm:mb-6 leading-[1.15] max-w-4xl mx-auto px-4"
      >
        Hello, I&apos;m Abhay Verma.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
        className="mb-0 px-4 text-base sm:text-lg md:text-xl lg:text-2xl font-normal leading-relaxed text-gray-700 dark:text-white/80 max-w-4xl mx-auto"
      >
        Developer, Software Engineer, and Lifelong Learner with over 2 years of professional experience building and optimizing digital products that people love to use.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
        className="mt-8 sm:mt-12 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3 md:gap-4 px-4 text-base md:text-lg font-medium w-full sm:w-auto"
      >
        <a
          href="#contact"
          className="w-full max-w-xs sm:w-auto justify-center group bg-slate-900/45 hover:bg-slate-900/65 text-white px-6 md:px-7 py-2.5 sm:py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 active:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-white/25 hover:border-white/40 backdrop-blur-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.45)] whitespace-nowrap shrink-0"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now());
          }}
        >
          <span className="whitespace-nowrap">Contact me here</span>{" "}
          <BsArrowRight className="opacity-90 group-hover:translate-x-1 transition shrink-0" />
        </a>

        <a
          className="w-full max-w-xs sm:w-auto justify-center group bg-transparent px-6 md:px-7 py-2.5 sm:py-3 flex items-center gap-2 rounded-full outline-none focus:scale-110 hover:scale-110 active:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-black/10 hover:border-black/25 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_28px_-5px_rgba(0,0,0,0.12),0_10px_14px_-6px_rgba(0,0,0,0.08)] dark:bg-white/5 dark:text-white/90 dark:border-white/15 dark:hover:border-white/35 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] dark:hover:bg-white/[0.12] hover:bg-black/[0.035] backdrop-blur-[16px] whitespace-nowrap shrink-0"
          href="/CV.pdf"
          download
        >
          <span className="whitespace-nowrap">Download CV</span>{" "}
          <HiDownload className="opacity-80 group-hover:translate-y-1 transition shrink-0" />
        </a>

        <div className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-3.5 mt-1 sm:mt-0 shrink-0">
          <a
            className="bg-transparent p-3 sm:p-3.5 md:p-4 text-gray-700 hover:text-gray-950 flex items-center gap-2 rounded-full focus:scale-[1.15] hover:scale-[1.15] active:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-black/10 hover:border-black/25 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_28px_-5px_rgba(0,0,0,0.12),0_10px_14px_-6px_rgba(0,0,0,0.08)] dark:bg-white/5 dark:text-white/90 dark:border-white/15 dark:hover:border-white/35 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] dark:hover:bg-white/[0.12] hover:bg-black/[0.035] backdrop-blur-[16px]"
            href="https://www.linkedin.com/in/abhay-verma-4b6b0b421/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
          >
            <BsLinkedin />
          </a>

          <a
            className="bg-transparent p-3 sm:p-3.5 md:p-4 text-gray-700 flex items-center gap-2 text-[1.2rem] md:text-[1.35rem] rounded-full focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-black/10 hover:border-black/25 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_28px_-5px_rgba(0,0,0,0.12),0_10px_14px_-6px_rgba(0,0,0,0.08)] dark:bg-white/5 dark:text-white/90 dark:border-white/15 dark:hover:border-white/35 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] dark:hover:bg-white/[0.12] hover:bg-black/[0.035] backdrop-blur-[16px]"
            href="https://github.com/abhayv175"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
          >
            <FaGithubSquare />
          </a>

          <a
            className="bg-transparent p-3 sm:p-3.5 md:p-4 text-gray-700 flex items-center gap-2 text-[1.2rem] md:text-[1.35rem] rounded-full focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950 active:scale-105 transition-all duration-300 ease-in-out cursor-pointer border border-black/10 hover:border-black/25 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_28px_-5px_rgba(0,0,0,0.12),0_10px_14px_-6px_rgba(0,0,0,0.08)] dark:bg-white/5 dark:text-white/90 dark:border-white/15 dark:hover:border-white/35 dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] dark:hover:bg-white/[0.12] hover:bg-black/[0.035] backdrop-blur-[16px]"
            href="https://leetcode.com/u/abhayv175/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LeetCode profile"
          >
            <SiLeetcode />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
