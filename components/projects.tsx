"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import SectionHeading from "./section-heading";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { useLenis } from "lenis/react";
import {
  FiExternalLink,
  FiGithub,
  FiActivity,
  FiSend,
  FiLayers,
  FiWifi,
  FiShield,
  FiDollarSign,
  FiArrowRight,
  FiCheckCircle,
  FiFileText,
  FiDatabase,
  FiTablet,
} from "react-icons/fi";
import { FaGamepad, FaQrcode } from "react-icons/fa";

type ProjectItem = (typeof projectsData)[number];

const mobileCardVariants = {
  hidden: {
    opacity: 0,
    x: 48,
    scale: 0.96,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const ProjectCardFocusContext = React.createContext<{
  isFocused: boolean;
  isMobile: boolean;
}>({
  isFocused: false,
  isMobile: false,
});

function MobileProjectCardWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInScroll = useInView(cardRef, {
    once: true,
    amount: 0.05,
  });
  const isMobileInCenter = useInView(cardRef, {
    margin: "-25% 0px -25% 0px",
    amount: 0.2,
    once: false,
  });

  return (
    <div ref={cardRef} className={className}>
      <motion.div
        initial="hidden"
        animate={isInScroll ? "visible" : "hidden"}
        variants={mobileCardVariants}
        className="w-full h-full transform-gpu will-change-transform"
      >
        <ProjectCardFocusContext.Provider
          value={{ isFocused: isMobileInCenter, isMobile: true }}
        >
          {children}
        </ProjectCardFocusContext.Provider>
      </motion.div>
    </div>
  );
}

interface ProjectRailItem {
  title: string;
  shortLabel: string;
  desktopWidthClass: string;
  render: (isHighlighted: boolean) => React.ReactNode;
}

function DesktopHorizontalProjects({
  items,
  highlightedCards,
  scrollTargetTitle,
  onScrollHandled,
}: {
  items: ProjectRailItem[];
  highlightedCards: string[];
  scrollTargetTitle: string | null;
  onScrollHandled: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardMetricsRef = useRef<{ left: number; width: number; center: number }[]>([]);
  const viewportWidthRef = useRef(0);
  const activeIndexRef = useRef(0);

  const lenis = useLenis();
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const measure = useCallback(() => {
    if (!viewportRef.current || !trackRef.current) return;
    const vw = viewportRef.current.clientWidth;
    const tw = trackRef.current.scrollWidth;
    viewportWidthRef.current = vw;
    const metrics = cardRefs.current.map((el) => {
      if (!el) return { left: 0, width: 0, center: 0 };
      const left = el.offsetLeft;
      const width = el.offsetWidth;
      return { left, width, center: left + width / 2 };
    });
    cardMetricsRef.current = metrics;
    const lastMetric = metrics[metrics.length - 1];
    const nextMaxTranslate = lastMetric
      ? Math.max(0, lastMetric.center - vw / 2)
      : Math.max(0, tw - vw);
    setMaxTranslate(nextMaxTranslate);
    setViewportHeight(window.innerHeight || 900);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const rawX = useTransform(scrollYProgress, [0, 1], [0, -maxTranslate]);
  const x = useSpring(rawX, {
    stiffness: 320,
    damping: 36,
    mass: 0.25,
    restDelta: 0.5,
  });

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (maxTranslate <= 0) return;
      const currentOffset = Math.min(1, Math.max(0, latest)) * maxTranslate;
      const centerLine = currentOffset + viewportWidthRef.current * 0.5;
      const metrics = cardMetricsRef.current;

      let closestIdx = 0;
      let minDist = Infinity;
      for (let idx = 0; idx < metrics.length; idx++) {
        const dist = Math.abs(metrics[idx].center - centerLine);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      }
      if (closestIdx !== activeIndexRef.current) {
        activeIndexRef.current = closestIdx;
        setActiveCardIndex(closestIdx);
      }
    });
  }, [scrollYProgress, maxTranslate]);

  const scrollToCard = useCallback(
    (index: number) => {
      const container = scrollContainerRef.current;
      const metric = cardMetricsRef.current[index];
      if (!container || !metric) return;

      const vw = viewportWidthRef.current;
      const desiredTranslate = Math.min(
        maxTranslate,
        Math.max(0, metric.left - (vw - metric.width) / 2)
      );
      const targetProgress =
        maxTranslate > 0 ? desiredTranslate / maxTranslate : 0;
      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const targetY = containerTop + targetProgress * maxTranslate;

      if (lenis) {
        lenis.scrollTo(targetY, { duration: 0.85 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    },
    [maxTranslate, lenis]
  );

  useEffect(() => {
    if (!scrollTargetTitle) return;
    const idx = items.findIndex((item) => item.title === scrollTargetTitle);
    if (idx !== -1) {
      // Wait briefly so vertical anchor scroll settles before targeting horizontal offset
      const timer = window.setTimeout(() => {
        scrollToCard(idx);
        onScrollHandled();
      }, 120);
      return () => window.clearTimeout(timer);
    }
    onScrollHandled();
  }, [scrollTargetTitle, items, scrollToCard, onScrollHandled]);

  const containerHeight = viewportHeight + maxTranslate;

  return (
    <div
      ref={scrollContainerRef}
      style={{ height: `${containerHeight}px` }}
      className="relative w-full"
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] pt-[5.25rem] sm:pt-24 pb-4 flex flex-col justify-start overflow-x-clip">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-center mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
              Projects
            </span>
          </div>
          <SectionHeading className="!mb-3">Projects</SectionHeading>
        </div>

        {/* Horizontal Viewport Frame */}
        <div
          ref={viewportRef}
          className="w-full overflow-x-clip pt-2 pb-4"
        >
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex flex-row items-stretch gap-6 w-max pl-6 sm:pl-12 lg:pl-[max(3rem,calc((100vw-72rem)/2))] pr-[50vw] transform-gpu will-change-transform"
          >
            <ProjectCardFocusContext.Provider
              value={{ isFocused: false, isMobile: false }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.title}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className={`${item.desktopWidthClass} shrink-0`}
                >
                  {item.render(highlightedCards.includes(item.title))}
                </div>
              ))}
            </ProjectCardFocusContext.Provider>
          </motion.div>
        </div>

        {/* Sleek Horizontal Progress Bar & Quick-Jump Pills */}
        <div className="w-full max-w-4xl mx-auto px-6 mt-1 flex flex-col items-center gap-2.5">
          <div className="w-48 sm:w-64 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "left center" }}
              className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {items.map((item, idx) => {
              const isCurrent = activeCardIndex === idx;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold transition-all duration-200 cursor-pointer border ${
                    isCurrent
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-white/35 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-black/10 dark:border-white/10 hover:text-zinc-950 dark:hover:text-white hover:border-indigo-400/40"
                  }`}
                >
                  0{idx + 1} · {item.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { ref: sectionRef } = useSectionInView("Projects", 0.08);
  const shouldReduceMotion = useReducedMotion();

  const [isDesktop, setIsDesktop] = useState(false);
  const [highlightedCards, setHighlightedCards] = useState<string[]>([]);
  const [scrollTargetTitle, setScrollTargetTitle] = useState<string | null>(
    null
  );

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    const handleHighlight = (e: Event) => {
      const customEvent = e as CustomEvent<{
        projects: string[];
        scrollToCard?: boolean;
      }>;
      if (customEvent.detail) {
        const nextProjects = customEvent.detail.projects || [];
        setHighlightedCards(nextProjects);
        if (customEvent.detail.scrollToCard && nextProjects.length > 0) {
          setScrollTargetTitle(nextProjects[0]);
        }
      }
    };

    window.addEventListener("highlight-projects", handleHighlight);
    return () =>
      window.removeEventListener("highlight-projects", handleHighlight);
  }, []);

  const clearScrollTarget = useCallback(() => {
    setScrollTargetTitle(null);
  }, []);

  const printPulse = projectsData[0]; // PrintPulse
  const moveIt = projectsData[1]; // Move It
  const passengerText = projectsData[2]; // Passenger Text
  const bankingApp = projectsData[3]; // Banking Application
  const pikaPanic = projectsData[4]; // Pika Panic

  const projectItems: ProjectRailItem[] = [
    {
      title: "PrintPulse",
      shortLabel: "PrintPulse",
      desktopWidthClass: "w-[min(820px,72vw)]",
      render: (isHighlighted) => (
        <PrintPulseFeaturedCard
          project={printPulse}
          isHighlighted={isHighlighted}
        />
      ),
    },
    {
      title: "Passenger Text",
      shortLabel: "Passenger",
      desktopWidthClass: "w-[min(450px,40vw)]",
      render: (isHighlighted) => (
        <PassengerTextCard
          project={passengerText}
          isHighlighted={isHighlighted}
        />
      ),
    },
    {
      title: "Pika Panic",
      shortLabel: "Pika Panic",
      desktopWidthClass: "w-[min(410px,36vw)]",
      render: (isHighlighted) => (
        <PikaPanicCard project={pikaPanic} isHighlighted={isHighlighted} />
      ),
    },
    {
      title: "Move It",
      shortLabel: "Move It",
      desktopWidthClass: "w-[min(440px,38vw)]",
      render: (isHighlighted) => (
        <SpotlightProjectCard
          project={moveIt}
          badge="Logistics & Fleet"
          isHighlighted={isHighlighted}
        />
      ),
    },
    {
      title: "Banking Application",
      shortLabel: "Banking",
      desktopWidthClass: "w-[min(440px,38vw)]",
      render: (isHighlighted) => (
        <BankingSystemCard
          project={bankingApp}
          isHighlighted={isHighlighted}
        />
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="scroll-mt-28 mb-28 w-full relative z-10 overflow-x-clip"
    >
      {isDesktop && !shouldReduceMotion ? (
        <DesktopHorizontalProjects
          items={projectItems}
          highlightedCards={highlightedCards}
          scrollTargetTitle={scrollTargetTitle}
          onScrollHandled={clearScrollTarget}
        />
      ) : (
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div className="flex justify-center mb-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
              Projects
            </span>
          </div>
          <SectionHeading>Projects</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {projectItems.map((item, idx) => {
              const spanClass =
                idx === 0
                  ? "col-span-1 md:col-span-12"
                  : idx === 1
                  ? "col-span-1 md:col-span-7"
                  : idx === 2
                  ? "col-span-1 md:col-span-5"
                  : "col-span-1 md:col-span-6";
              return (
                <MobileProjectCardWrapper
                  key={item.title}
                  className={spanClass}
                >
                  {item.render(highlightedCards.includes(item.title))}
                </MobileProjectCardWrapper>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================================
   SUB-COMPONENT 1: PrintPulse Featured Card (With Dynamic Point Photo Switcher)
   ========================================================================= */
function PrintPulseFeaturedCard({
  project,
  isHighlighted,
}: {
  project: ProjectItem;
  isHighlighted: boolean;
}) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const steps = [
    {
      id: 1,
      title: "Customer Web Portal",
      subtitle: "Instant zero-install upload",
      meta: "Auto page count • Sheet preview",
      latency: "12ms",
      badge: "Web Portal",
    },
    {
      id: 2,
      title: "Direct UPI Settlement",
      subtitle: "NPCI dynamic QR & verification",
      meta: "0% Gateway fee • Instant settlement",
      latency: "18ms",
      badge: "Direct UPI",
    },
    {
      id: 3,
      title: "Vendor Android Tablet",
      subtitle: "Native Flutter kiosk spooler",
      meta: "Sub-50ms WebSocket push • Auto-print",
      latency: "44ms",
      badge: "Vendor App",
    },
  ];

  const { isFocused } = React.useContext(ProjectCardFocusContext);

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
    }, 900);

    setTimeout(() => {
      setActiveStep(3);
    }, 1800);

    setTimeout(() => {
      setIsSimulating(false);
    }, 2700);
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`w-full h-full p-5 sm:p-7 rounded-3xl backdrop-blur-md border transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative overflow-hidden flex flex-col lg:flex-row gap-6 items-center group ${
        isHighlighted
          ? "border-cyan-500 ring-2 ring-cyan-500/50 bg-white/85 dark:bg-zinc-900/95 shadow-[0_20px_50px_rgba(56,189,248,0.3)] -translate-y-1.5"
          : isFocused
          ? "border-cyan-400/80 dark:border-cyan-400/80 bg-white/75 dark:bg-zinc-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(56,189,248,0.32)] scale-[1.03] -translate-y-1"
          : "border-black/10 dark:border-white/10 bg-white/35 dark:bg-zinc-900/40 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(56,189,248,0.32)] hover:border-cyan-400/70 dark:hover:border-cyan-400/70 hover:bg-white/65 dark:hover:bg-zinc-900/75"
      }`}
    >
      {/* Background Top Ambient Accent (zero-blur radial gradient for smooth 60fps rail scroll) */}
      <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_68%)] pointer-events-none" />
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent ${
          isFocused ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-150 ease-out pointer-events-none`}
      />

      {/* Left Column: Project Overview & Meta */}
      <div className="flex-1 text-left relative z-10 w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Featured Infrastructure</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 border border-black/5 dark:border-white/10">
              Sub-50ms Relay
            </span>
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit PrintPulse Live Website"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform"
            title="Visit live website"
          >
            <FiExternalLink />
          </a>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-2.5">
          {project.title}
        </h3>

        <p className="text-sm sm:text-[0.95rem] leading-relaxed text-gray-600 dark:text-zinc-300 font-normal mb-5 max-w-xl">
          {project.description}
        </p>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-800 dark:text-zinc-200"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* External Quick Action Links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-md transition-all active:scale-95"
          >
            <span>Live Website</span>
            <FiExternalLink className="text-sm" />
          </a>
          <a
            href={
              (project as any).githubUrl ||
              "https://github.com/abhayv175/PrintPulse"
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:scale-110 hover:bg-black/10 dark:hover:bg-white/15 transition-all text-base border border-black/5 dark:border-white/10"
            title="View GitHub Repository"
          >
            <FiGithub />
          </a>
          <button
            type="button"
            onClick={handleSimulate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <FiActivity className={isSimulating ? "animate-spin" : ""} />
            <span>Simulate Packet Flow</span>
          </button>
        </div>
      </div>

      {/* Right Column: Live Interactive Packet Flow Simulator + Real Dynamic Screenshot Switcher */}
      <div className="w-full lg:w-[46%] flex flex-col gap-2.5 relative z-10">
        {/* The 3 Pipeline Stages (Clickable to switch photo below) */}
        <div className="flex flex-col gap-2">
          {steps.map((s) => {
            const isActive = activeStep === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`p-3 rounded-2xl border transition-[border-color,background-color,box-shadow,transform] duration-200 cursor-pointer flex items-center justify-between group/step ${
                  isActive
                    ? "bg-indigo-500/15 dark:bg-indigo-950/70 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/30 scale-[1.01]"
                    : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    0{s.id}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                      {s.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {s.latency}
                  </span>
                  <p className="text-[0.68rem] text-zinc-400 hidden xs:block">
                    {s.meta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Real Screenshot Container: Switches based on activeStep */}
        <div className="relative h-40 sm:h-44 w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 mt-0.5 shadow-inner bg-slate-950">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step-1-customer"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 w-full h-full bg-slate-950"
              >
                <Image
                  src="/printpulse/02_portal_active_order_desktop.png"
                  alt="Customer Web Portal — Real Multi-Document Queue & Pricing"
                  fill
                  className="object-cover object-top filter brightness-95 dark:brightness-90 transition-transform duration-300 hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 550px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3 gap-2 justify-between pointer-events-none">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5 min-w-0 drop-shadow">
                    <FaQrcode className="text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Customer Web Portal: Active Queue & Pricing
                    </span>
                  </span>
                  <span className="text-[0.68rem] font-mono font-bold text-emerald-400 bg-black/70 px-2 py-0.5 rounded-full border border-white/10 shrink-0 whitespace-nowrap">
                    Zero Install
                  </span>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2-upi"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden"
              >
                <Image
                  src="/printpulse/04_portal_upi_qr_modal_mobile.png"
                  alt="PrintPulse Direct NPCI UPI QR & Verification Modal"
                  fill
                  className="object-cover object-top filter brightness-95 dark:brightness-90 transition-transform duration-300 hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 550px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3 gap-2 justify-between pointer-events-none">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5 min-w-0 drop-shadow">
                    <FiShield className="text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Direct NPCI UPI QR & 12-Digit UTR Settlement
                    </span>
                  </span>
                  <span className="text-[0.68rem] font-mono font-bold text-emerald-400 bg-black/70 px-2 py-0.5 rounded-full border border-white/10 shrink-0 whitespace-nowrap">
                    0% Gateway Fee
                  </span>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step-3-vendor-app"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden"
              >
                <Image
                  src="/printpulse/vendor_03_dashboard_home.jpg"
                  alt="PrintPulse Native Flutter Vendor Tablet Dashboard & Spooler"
                  fill
                  className="object-cover object-top filter brightness-95 dark:brightness-90 transition-transform duration-300 hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 550px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3 gap-2 justify-between pointer-events-none">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5 min-w-0 drop-shadow">
                    <FiTablet className="text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Flutter Kiosk Terminal: Printer Spooler & Stats
                    </span>
                  </span>
                  <span className="text-[0.68rem] font-mono font-bold text-emerald-400 bg-black/70 px-2 py-0.5 rounded-full border border-white/10 shrink-0 whitespace-nowrap">
                    Sub-50ms Spool
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   SUB-COMPONENT 2: Passenger Text (Simulated Real-Time Typing on Hover)
   ========================================================================= */
function PassengerTextCard({
  project,
  isHighlighted,
}: {
  project: ProjectItem;
  isHighlighted: boolean;
}) {
  const { isFocused } = React.useContext(ProjectCardFocusContext);
  const [isHovered, setIsHovered] = useState(false);
  const isCardActive = isHovered || isFocused;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.018 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-full p-5 sm:p-7 rounded-3xl backdrop-blur-md border transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative overflow-hidden flex flex-col justify-between text-left group ${
        isHighlighted
          ? "border-blue-500 ring-2 ring-blue-500/50 bg-white/85 dark:bg-zinc-900/95 shadow-[0_20px_50px_rgba(59,130,246,0.3)] -translate-y-1.5"
          : isFocused
          ? "border-blue-400/70 dark:border-blue-400/70 bg-white/75 dark:bg-zinc-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(59,130,246,0.28)] scale-[1.03] -translate-y-1"
          : "border-black/10 dark:border-white/10 bg-white/35 dark:bg-zinc-900/40 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(59,130,246,0.28)] hover:border-blue-400/60 dark:hover:border-blue-400/60 hover:bg-white/65 dark:hover:bg-zinc-900/75"
      }`}
    >
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-transparent ${
          isFocused ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-150 ease-out pointer-events-none`}
      />

      <div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Real-Time Messaging
          </span>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Passenger Text GitHub"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform"
          >
            <FiGithub />
          </a>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white mb-2 tracking-tight relative z-10">
          {project.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-zinc-300 mb-5 leading-relaxed font-normal relative z-10">
          {project.description}
        </p>

        {/* Simulated Real-Time Chat Typing Animation Container */}
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/10 mb-5 flex flex-col gap-2.5 relative z-10">
          {/* Incoming Message */}
          <div className="flex items-start gap-2 max-w-[85%]">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-[0.65rem] font-bold text-white flex items-center justify-center shrink-0">
              AV
            </div>
            <div className="px-3 py-1.5 rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-800 text-xs text-gray-900 dark:text-zinc-100 shadow-sm border border-black/5 dark:border-white/5">
              <span>Hey Abhay, is the cloud sync ready?</span>
            </div>
          </div>

          {/* Outgoing Message with Hover-Reactive Delivery */}
          <div className="flex items-end justify-end gap-2 self-end max-w-[85%]">
            <div className="px-3 py-1.5 rounded-2xl rounded-br-sm bg-indigo-600 text-xs text-white shadow-sm flex items-center gap-1.5">
              {isCardActive ? (
                <motion.span
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Pushed to Pusher & MongoDB! ⚡
                </motion.span>
              ) : (
                <span className="flex items-center gap-1 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 relative z-10">
        {project.tags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-[0.72rem] font-medium rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* =========================================================================
   SUB-COMPONENT 3: Pika Panic (Unity Game Artwork)
   ========================================================================= */
function PikaPanicCard({
  project,
  isHighlighted,
}: {
  project: Extract<ProjectItem, { imageUrl: unknown }>;
  isHighlighted: boolean;
}) {
  const { isFocused } = React.useContext(ProjectCardFocusContext);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.018 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`w-full h-full p-5 sm:p-7 rounded-3xl backdrop-blur-md border transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative overflow-hidden flex flex-col justify-between text-left group ${
        isHighlighted
          ? "border-purple-500 ring-2 ring-purple-500/50 bg-white/85 dark:bg-zinc-900/95 shadow-[0_20px_50px_rgba(168,85,247,0.3)] -translate-y-1.5"
          : isFocused
          ? "border-purple-400/70 dark:border-purple-400/70 bg-white/75 dark:bg-zinc-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(168,85,247,0.28)] scale-[1.03] -translate-y-1"
          : "border-black/10 dark:border-white/10 bg-white/35 dark:bg-zinc-900/40 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(168,85,247,0.28)] hover:border-purple-400/60 dark:hover:border-purple-400/60 hover:bg-white/65 dark:hover:bg-zinc-900/75"
      }`}
    >
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 via-violet-500/15 to-transparent ${
          isFocused ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-150 ease-out pointer-events-none`}
      />

      <div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
            <FaGamepad className="text-xs" />
            <span>Unity 3D Engine</span>
          </span>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pika Panic Unity Details"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform"
          >
            <FiExternalLink />
          </a>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white mb-2 tracking-tight relative z-10">
          {project.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-zinc-300 mb-4 leading-relaxed font-normal relative z-10">
          {project.description}
        </p>

        {/* 3D Floating Layer Mockup */}
        <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 mb-4 shadow-md group-hover:scale-[1.03] transition-transform duration-300 relative z-10">
          <Image
            src={project.imageUrl}
            alt="Pika Panic Unity Game Artwork"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 350px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
            <span className="text-[0.72rem] font-semibold text-white drop-shadow">
              Vilnius Landmarks Level Design
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 relative z-10">
        {project.tags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-[0.72rem] font-medium rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* =========================================================================
   SUB-COMPONENT 4: Move It (Cursor-Tracking Border Spotlight Glass Card)
   ========================================================================= */
function SpotlightProjectCard({
  project,
  badge,
  isHighlighted,
}: {
  project: Extract<ProjectItem, { imageUrl: unknown }>;
  badge: string;
  isHighlighted: boolean;
}) {
  const { isFocused } = React.useContext(ProjectCardFocusContext);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const { left, top } = cardRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - left, y: e.clientY - top });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -6, scale: 1.018 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className={`w-full h-full p-5 sm:p-7 rounded-3xl backdrop-blur-md border transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative overflow-hidden flex flex-col justify-between text-left group ${
        isHighlighted
          ? "border-emerald-500 ring-2 ring-emerald-500/50 bg-white/85 dark:bg-zinc-900/95 shadow-[0_20px_50px_rgba(16,185,129,0.3)] -translate-y-1.5"
          : isFocused
          ? "border-emerald-400/70 dark:border-emerald-400/70 bg-white/75 dark:bg-zinc-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(16,185,129,0.28)] scale-[1.03] -translate-y-1"
          : "border-black/10 dark:border-white/10 bg-white/35 dark:bg-zinc-900/40 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(16,185,129,0.28)] hover:border-emerald-400/60 dark:hover:border-emerald-400/60 hover:bg-white/65 dark:hover:bg-zinc-900/75"
      }`}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.2), transparent 80%)`,
        }}
      />
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent ${
          isFocused ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-150 ease-out pointer-events-none`}
      />

      <div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {badge}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live Demo"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform"
            >
              <FiExternalLink />
            </a>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white mb-2 tracking-tight relative z-10">
          {project.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-zinc-300 mb-5 leading-relaxed font-normal relative z-10">
          {project.description}
        </p>

        {/* Thumbnail Preview Banner */}
        <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 mb-5 shadow-sm group-hover:scale-[1.02] transition-transform duration-300 relative z-10">
          <Image
            src={project.imageUrl}
            alt="Move It logistics delivery dashboard preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 450px"
          />
        </div>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[0.72rem] font-medium rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
        >
          <span>Demo</span>
          <FiArrowRight />
        </a>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   SUB-COMPONENT 5: Banking Application (JavaFX Fintech Ledger Card)
   ========================================================================= */
function BankingSystemCard({
  project,
  isHighlighted,
}: {
  project: ProjectItem;
  isHighlighted: boolean;
}) {
  const { isFocused } = React.useContext(ProjectCardFocusContext);
  const [balance, setBalance] = useState(14500);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.018 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`w-full h-full p-5 sm:p-7 rounded-3xl backdrop-blur-md border transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out relative overflow-hidden flex flex-col justify-between text-left group ${
        isHighlighted
          ? "border-amber-500 ring-2 ring-amber-500/50 bg-white/85 dark:bg-zinc-900/95 shadow-[0_20px_50px_rgba(245,158,11,0.3)] -translate-y-1.5"
          : isFocused
          ? "border-amber-400/70 dark:border-amber-400/70 bg-white/75 dark:bg-zinc-900/80 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(245,158,11,0.28)] scale-[1.03] -translate-y-1"
          : "border-black/10 dark:border-white/10 bg-white/35 dark:bg-zinc-900/40 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_35px_rgba(245,158,11,0.28)] hover:border-amber-400/60 dark:hover:border-amber-400/60 hover:bg-white/65 dark:hover:bg-zinc-900/75"
      }`}
    >
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/20 via-cyan-500/15 to-transparent ${
          isFocused ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-150 ease-out pointer-events-none`}
      />

      <div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <FiShield className="text-xs" />
            <span>JavaFX Financial Core</span>
          </span>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Banking Application GitHub"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform"
          >
            <FiGithub />
          </a>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white mb-2 tracking-tight relative z-10">
          {project.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-zinc-300 mb-4 leading-relaxed font-normal relative z-10">
          {project.description}
        </p>

        {/* Micro-Sparkline Ledger Preview */}
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-black/30 border border-black/5 dark:border-white/10 mb-5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <FiDollarSign className="text-base" />
            </div>
            <div>
              <p className="text-[0.7rem] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Simulated Vault
              </p>
              <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                ${balance.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBalance((prev) => prev + 250)}
            className="text-[0.72rem] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer active:scale-95"
          >
            + Quick Deposit
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 relative z-10">
        {project.tags.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 text-[0.72rem] font-medium rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
