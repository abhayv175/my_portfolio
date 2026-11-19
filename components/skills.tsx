"use client";

import React, { useRef, useState, useEffect } from "react";
import SectionHeading from "./section-heading";
import { useSectionInView } from "@/lib/hooks";
import { motion, useInView } from "framer-motion";
import {
  FiLayout,
  FiServer,
  FiCheckCircle,
  FiLayers,
  FiZap,
} from "react-icons/fi";

// Categorized domain skills with matching project mappings for cross-highlighting
const SKILL_DOMAINS = [
  {
    id: "frontend-mobile",
    title: "Frontend & Mobile",
    subtitle: "Fluid UI, Responsive Systems & Cross-Platform Apps",
    icon: FiLayout,
    accentColor: "from-blue-500/20 to-indigo-500/20",
    borderColor: "hover:border-blue-500/50 dark:hover:border-blue-400/50",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    highlightTag: "Frontend",
    matchedProjects: ["PrintPulse", "Move It", "Passenger Text"],
    skills: [
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Flutter",
      "Tailwind CSS",
      "UI/UX Design",
      "Redux",
    ],
  },
  {
    id: "backend-cloud",
    title: "Backend & Cloud Architecture",
    subtitle: "High-Throughput APIs, WebSockets & Distributed Data",
    icon: FiServer,
    accentColor: "from-emerald-500/20 to-cyan-500/20",
    borderColor: "hover:border-emerald-500/50 dark:hover:border-emerald-400/50",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    highlightTag: "Backend",
    matchedProjects: ["PrintPulse", "Passenger Text", "Banking Application"],
    skills: [
      "Python",
      "FastAPI",
      "REST APIs",
      "WebSockets",
      "Docker",
      "MongoDB",
      "MS SQL",
      "Linux / Bash",
      "GitHub CI/CD",
    ],
  },
  {
    id: "qa-testing",
    title: "QA, Modem Testing & Game Dev",
    subtitle: "Modem Protocols, Regression & Real-Time Engine Physics",
    icon: FiCheckCircle,
    accentColor: "from-amber-500/20 to-rose-500/20",
    borderColor: "hover:border-amber-500/50 dark:hover:border-amber-400/50",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    highlightTag: "QA/Testing",
    matchedProjects: ["Pika Panic", "PrintPulse"],
    skills: [
      "Cross Platform Testing",
      "Regression Testing",
      "Protocol Debugging",
      "API Testing",
      "Custom OS Testing",
      "Jira",
      "Unity Engine",
      "C#",
      "C++",
      "Plastic SCM",
    ],
  },
];

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

const SkillCardFocusContext = React.createContext<{ isFocused: boolean }>({ isFocused: false });

function SkillCardScrollWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInScroll = useInView(cardRef, {
    once: false,
    margin: "-80px 0px -80px 0px",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isFocused = isMobile ? isInView : false;

  return (
    <div ref={cardRef} className={`w-full h-full ${className}`}>
      <motion.div
        initial="hidden"
        animate={isInScroll ? "visible" : "hidden"}
        variants={cardVariants}
        viewport={
          isMobile
            ? { margin: "-25% 0px -25% 0px", amount: 0.2, once: false }
            : undefined
        }
        onViewportEnter={() => {
          if (isMobile) setIsInView(true);
        }}
        onViewportLeave={() => {
          if (isMobile) setIsInView(false);
        }}
        className="w-full h-full transform-gpu will-change-transform"
      >
        <SkillCardFocusContext.Provider value={{ isFocused }}>
          {children}
        </SkillCardFocusContext.Provider>
      </motion.div>
    </div>
  );
}

function SkillDomainCard({
  domain,
  activeCategory,
  setActiveCategory,
  handleCategoryHover,
}: {
  domain: (typeof SKILL_DOMAINS)[number];
  activeCategory: string | null;
  setActiveCategory: (id: string | null) => void;
  handleCategoryHover: (projects: string[] | null) => void;
}) {
  const { isFocused } = React.useContext(SkillCardFocusContext);
  const Icon = domain.icon;
  const isHovered = activeCategory === domain.id;
  const isCardActive = isHovered || isFocused;

  return (
    <div
      onMouseEnter={() => {
        setActiveCategory(domain.id);
        handleCategoryHover(domain.matchedProjects);
      }}
      onMouseLeave={() => {
        setActiveCategory(null);
        handleCategoryHover(null);
      }}
      className={`group relative p-5 sm:p-6 rounded-3xl backdrop-blur-xl border transition-all duration-300 cursor-default flex flex-col justify-between w-full h-full ${
        isCardActive
          ? domain.id === "frontend-mobile"
            ? "border-blue-500/60 dark:border-blue-400/60 bg-white/90 dark:bg-zinc-900/80 shadow-[0_16px_40px_rgba(0,0,0,0.12),0_0_30px_rgba(59,130,246,0.3)] -translate-y-1.5 scale-[1.03]"
            : domain.id === "backend-cloud"
            ? "border-emerald-500/60 dark:border-emerald-400/60 bg-white/90 dark:bg-zinc-900/80 shadow-[0_16px_40px_rgba(0,0,0,0.12),0_0_30px_rgba(16,185,129,0.3)] -translate-y-1.5 scale-[1.03]"
            : "border-purple-500/60 dark:border-purple-400/60 bg-white/90 dark:bg-zinc-900/80 shadow-[0_16px_40px_rgba(0,0,0,0.12),0_0_30px_rgba(168,85,247,0.3)] -translate-y-1.5 scale-[1.03]"
          : `border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/40 shadow-lg hover:shadow-xl`
      }`}
    >
      {/* Subtle Top Ambient Gradient Sheen */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${domain.accentColor} ${
          isCardActive ? "opacity-100" : "opacity-0"
        } group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />

      <div className="relative z-10">
        {/* Header: Icon + Highlight Badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-black/5 dark:bg-white/10 text-xl text-gray-900 dark:text-white border border-black/5 dark:border-white/10 ${
              isCardActive ? "scale-110" : "group-hover:scale-110"
            } transition-transform duration-300`}
          >
            <Icon />
          </div>
          <span className="text-[0.7rem] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-black/5 dark:border-white/10 flex items-center gap-1">
            <FiZap className="text-amber-500 text-xs" />
            <span>Highlights {domain.matchedProjects.length} Apps</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-1 tracking-tight">
          {domain.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          {domain.subtitle}
        </p>

        {/* Skill Pills */}
        <div className="flex flex-wrap gap-1.5">
          {domain.skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="text-[0.75rem] font-medium px-2.5 py-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-800 dark:text-gray-200 transition-colors duration-200 group-hover:border-black/15 dark:group-hover:border-white/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Indicator */}
      <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[0.72rem] text-gray-500 dark:text-gray-400 relative z-10">
        <span className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
          <FiLayers className="text-xs" />
          <span>{domain.matchedProjects.join(" • ")}</span>
        </span>
      </div>
    </div>
  );
}

export default function Skills() {
  const { ref: sectionRef } = useSectionInView("Skills", 0.25);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Dispatch cross-section highlight event to Project cards
  const handleCategoryHover = (matchedProjects: string[] | null) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("highlight-projects", {
          detail: { projects: matchedProjects || [] },
        })
      );
    }
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="mb-28 max-w-[62rem] scroll-mt-28 text-center sm:mb-40 px-4 mx-auto relative z-10"
    >
      <div className="w-full">
        <div className="flex justify-center mb-2">
          <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm">
            Skills
          </span>
        </div>
        <SectionHeading>Skills</SectionHeading>

        {/* Grouped Interactive Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-0 text-left">
          {SKILL_DOMAINS.map((domain) => (
            <SkillCardScrollWrapper key={domain.id}>
              <SkillDomainCard
                domain={domain}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                handleCategoryHover={handleCategoryHover}
              />
            </SkillCardScrollWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
