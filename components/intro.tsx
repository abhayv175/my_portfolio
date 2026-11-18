"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";

const EMOJIS = ["👋", "🚀", "💻", "⚡", "🎯", "🔥"];

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
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
                className="absolute inset-0 w-full h-full rounded-full p-[2.5px] bg-gradient-to-tr from-indigo-500/30 via-slate-500/20 to-sky-500/30 shadow-xl transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white/95 border-2 border-black/10 shadow-xl backdrop-blur-md">
                  <Image
                    src="/hero_light.png"
                    alt="Abhay Verma portrait"
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
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
                className="absolute inset-0 w-full h-full rounded-full p-[2.5px] bg-gradient-to-tr from-indigo-500/30 via-slate-500/20 to-sky-500/30 shadow-xl transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-950 border-2 border-white/20 shadow-xl backdrop-blur-md">
                  <Image
                    src="/hero_dark.png"
                    alt="Abhay Verma portrait"
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
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
          Hello, I&apos;m{" "}
          <span className="text-gray-950 dark:text-white font-black">
            Abhay Verma
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
          className="mb-0 px-4 text-base sm:text-lg md:text-xl lg:text-2xl font-normal leading-relaxed text-gray-700 dark:text-white/80 max-w-4xl mx-auto"
        >
          Developer, Software Engineer, and Lifelong Learner with over 2 years of professional experience building and optimizing digital products that people love to use.
        </motion.p>

        {/* Realigned Hero Action Buttons & Social Profile Links */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
          className="mt-8 sm:mt-12 md:mt-14 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 px-4 text-base md:text-lg font-medium w-full sm:w-auto"
        >
          {/* Primary Action Button: Download CV */}
          <a
            className="group bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-7 py-3 flex items-center justify-center gap-2.5 rounded-full outline-none focus:scale-105 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer border border-black/10 dark:border-white/20 shadow-md hover:shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap shrink-0 text-base font-semibold"
            href="/CV.pdf"
            download
          >
            <span className="whitespace-nowrap">Download CV</span>{" "}
            <HiDownload className="opacity-90 group-hover:translate-y-1 transition duration-300 shrink-0 text-lg" />
          </a>

          {/* Social Quick Links with Clean Frosted Glass Styling */}
          <div className="flex items-center justify-center gap-3 shrink-0">
            <a
              className="bg-white/80 dark:bg-zinc-900/80 p-3.5 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30 shadow-sm hover:shadow-md backdrop-blur-md text-lg"
              href="https://www.linkedin.com/in/abhay-verma-4b6b0b421/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
            >
              <BsLinkedin />
            </a>

            <a
              className="bg-white/80 dark:bg-zinc-900/80 p-3.5 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30 shadow-sm hover:shadow-md backdrop-blur-md text-lg"
              href="https://github.com/abhayv175"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
            >
              <FaGithubSquare />
            </a>

            <a
              className="bg-white/80 dark:bg-zinc-900/80 p-3.5 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30 shadow-sm hover:shadow-md backdrop-blur-md text-lg"
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
