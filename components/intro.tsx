"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BsLinkedin } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { FaGithubSquare } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "@/context/theme-context";
import Magnetic from "@/components/magnetic";
import { SURFACE } from "./surface-styles";

const EMOJIS = ["👋", "🚀", "💻", "⚡", "🎯", "🔥"];
const GREETING_PREFIX = "Hi, I'm ";
const GREETING_NAME = "Abhay Verma";
const FULL_GREETING = `${GREETING_PREFIX}${GREETING_NAME}`;

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [manualFlip, setManualFlip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setManualFlip(false);
  }, [theme]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedCount(FULL_GREETING.length);
      setShowCursor(false);
      return;
    }

    let timeoutId: number;
    let current = 0;

    const step = () => {
      current += 1;
      setTypedCount(current);

      if (current < FULL_GREETING.length) {
        const justTyped = FULL_GREETING[current - 1];
        const delay = justTyped === "," ? 190 : 46;
        timeoutId = window.setTimeout(step, delay);
      } else {
        timeoutId = window.setTimeout(() => {
          setShowCursor(false);
        }, 1200);
      }
    };

    timeoutId = window.setTimeout(step, 380);
    return () => window.clearTimeout(timeoutId);
  }, [shouldReduceMotion]);

  const clampedTyped = Math.min(typedCount, FULL_GREETING.length);
  const visiblePrefixCount = Math.min(clampedTyped, GREETING_PREFIX.length);
  const visiblePrefix = FULL_GREETING.slice(0, visiblePrefixCount);
  const hiddenPrefix = FULL_GREETING.slice(
    visiblePrefixCount,
    GREETING_PREFIX.length
  );
  const visibleNameCount = Math.max(0, clampedTyped - GREETING_PREFIX.length);
  const visibleName = GREETING_NAME.slice(0, visibleNameCount);
  const hiddenName = GREETING_NAME.slice(visibleNameCount);
  const cursorInPrefix = clampedTyped <= GREETING_PREFIX.length;

  const cursorElement = showCursor ? (
    <span className="relative inline">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[1px] bottom-[-0.06em] w-[2.5px] sm:w-[3.5px] h-[0.88em] rounded-full bg-indigo-500 dark:bg-sky-400 animate-pulse"
      />
    </span>
  ) : null;

  const handleAvatarClick = () => {
    setManualFlip((prev) => !prev);
    setEmojiIndex((prev) => (prev + 1) % EMOJIS.length);
  };

  const showDarkFace = (theme === "dark") !== manualFlip;

  return (
    <section
      ref={ref}
      id="home"
      className="w-full flex flex-col items-center relative text-center scroll-mt-[100rem] pt-24 sm:pt-28 md:pt-36 pb-0"
    >
      {/* Central Hero Avatar with Orbital Photon-Ring Halo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.22, 0.61, 0.36, 1], delay: 0.12 }}
        className="flex justify-center mb-6 sm:mb-8 mt-4 sm:mt-6 z-20"
      >
        <div
          onClick={handleAvatarClick}
          className="group relative cursor-pointer select-none transition-transform duration-500 ease-out hover:scale-105 sm:hover:scale-[1.07] active:scale-95"
          title="Click to flip between childhood & now!"
        >
          {/* Ambient Orbital Halo Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-full bg-indigo-500/15 dark:bg-sky-400/20 blur-md opacity-60 group-hover:opacity-95 transition-opacity duration-500"
          />

          {/* Slow-Spinning Photon-Ring Frame */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -inset-[2.5px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(15,23,42,0.75)_60deg,rgba(79,70,229,0.55)_125deg,transparent_205deg,rgba(15,23,42,0.18)_295deg,transparent_360deg)] dark:bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.85)_60deg,rgba(56,189,248,0.65)_125deg,transparent_205deg,rgba(255,255,255,0.22)_295deg,transparent_360deg)] ${
              shouldReduceMotion ? "" : "animate-[spin_14s_linear_infinite]"
            }`}
          />

          {/* 3D Perspective Card Container */}
          <div
            style={{ perspective: 1000 }}
            className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36"
          >
            <motion.div
              initial={false}
              animate={{ rotateY: showDarkFace ? 180 : 0 }}
              transition={
                mounted
                  ? { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0 }
              }
              style={{
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
              }}
              className="relative w-full h-full transform-gpu"
            >
              {/* Light Mode Face (Front - 0deg: Current Adult Portrait) */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className="absolute inset-0 w-full h-full rounded-full overflow-hidden bg-white border border-black/15 shadow-[0_12px_32px_rgba(15,23,42,0.14)]"
              >
                <Image
                  src="/hero_light.png"
                  alt="Abhay Verma portrait"
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                  loading="eager"
                  className="object-cover object-center scale-[1.03]"
                />
              </div>

              {/* Dark Mode Face (Back - 180deg: Childhood Portrait) */}
              <div
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
                className="absolute inset-0 w-full h-full rounded-full overflow-hidden bg-[#06060b] border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.85)]"
              >
                <Image
                  src="/hero_dark.png"
                  alt="Abhay Verma childhood portrait"
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                  loading="eager"
                  className="object-cover object-top"
                />
              </div>
            </motion.div>
          </div>

          {/* Sleek Corner Interactive Badge */}
          <div
            className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full ${SURFACE.modal} shadow-md transition-transform duration-300 group-hover:scale-110 z-10`}
          >
            <motion.span
              key={emojiIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="text-sm sm:text-base select-none leading-none"
            >
              {EMOJIS[emojiIndex]}
            </motion.span>
          </div>
        </div>
      </motion.div>

        {/* Zero-reflow Typed Headline Typography: characters reveal in-place at final centered coordinates */}
        <div className="py-1 mb-4 sm:mb-6 w-full max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, ease: [0.22, 0.61, 0.36, 1], delay: 0.26 }}
            className="relative w-full text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.15]"
          >
            <span className="sr-only">{FULL_GREETING}</span>
            <span aria-hidden="true" className="block">
              <span>{visiblePrefix}</span>
              {cursorInPrefix && cursorElement}
              {hiddenPrefix && (
                <span className="invisible select-none">{hiddenPrefix}</span>
              )}
              <span className="font-black text-gray-950 dark:text-white">
                <span>{visibleName}</span>
                {!cursorInPrefix && cursorElement}
                {hiddenName && (
                  <span className="invisible select-none">{hiddenName}</span>
                )}
              </span>
            </span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 0.61, 0.36, 1], delay: 0.42 }}
          className="mb-0 px-4 text-base sm:text-lg md:text-xl lg:text-2xl font-normal leading-relaxed text-gray-900 dark:text-white/85 max-w-4xl mx-auto text-pretty drop-shadow-[0_1px_12px_rgba(250,250,250,0.95)] dark:drop-shadow-none"
        >
          Developer, Software Engineer, and Lifelong Learner with over 2 years of professional experience building and optimizing digital products that people love to use.
        </motion.p>

        {/* Realigned Hero Action Buttons & Social Profile Links with Magnetic Pull */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 0.61, 0.36, 1], delay: 0.56 }}
          className="mt-8 sm:mt-12 md:mt-14 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 px-4 text-base md:text-lg font-medium w-full sm:w-auto"
        >
          {/* Primary Action Button: Download CV with Magnetic Pull */}
          <Magnetic strength={0.25}>
            <a
              className="group bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 px-7 py-3 flex items-center justify-center gap-2.5 rounded-full outline-none focus:scale-105 hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer border border-black/10 dark:border-white/20 shadow-md hover:shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] whitespace-nowrap shrink-0 text-base font-semibold"
              href="/CV.pdf"
              download
            >
              <span className="whitespace-nowrap">Download CV</span>{" "}
              <HiDownload className="opacity-90 group-hover:translate-y-1 transition duration-300 shrink-0 text-lg" />
            </a>
          </Magnetic>

          {/* Social Quick Links with Magnetic Pull */}
          <div className="flex items-center justify-center gap-3 shrink-0">
            <Magnetic strength={0.35}>
              <a
                className={`${SURFACE.pillInteractive} p-3.5 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer hover:border-black/30 dark:hover:border-white/30 shadow-sm hover:shadow-md text-lg`}
                href="https://www.linkedin.com/in/abhayv175/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
              >
                <BsLinkedin />
              </a>
            </Magnetic>

            <Magnetic strength={0.35}>
              <a
                className={`${SURFACE.pillInteractive} p-3.5 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer hover:border-black/30 dark:hover:border-white/30 shadow-sm hover:shadow-md text-lg`}
                href="https://github.com/abhayv175"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
              >
                <FaGithubSquare />
              </a>
            </Magnetic>

            <Magnetic strength={0.35}>
              <a
                className={`${SURFACE.pillInteractive} p-3.5 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer hover:border-black/30 dark:hover:border-white/30 shadow-sm hover:shadow-md text-lg`}
                href="https://leetcode.com/u/abhayv175/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LeetCode profile"
              >
                <SiLeetcode />
              </a>
            </Magnetic>
          </div>
        </motion.div>
    </section>
  );
}
