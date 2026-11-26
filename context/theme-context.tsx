"use client";

import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { spaceAudio } from "@/lib/space-audio";

type Theme = "light" | "dark";

type ThemeContextProviderProps = {
  children: React.ReactNode;
};

type ThemeContextType = {
  theme: Theme;
  targetTheme: Theme;
  isTransitioning: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const WEBGPU_MIDPOINT_DELAY_MS = 320;
const TRANSITION_TOTAL_MS = 1040;

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [targetTheme, setTargetTheme] = useState<Theme>("dark");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const midpointTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (midpointTimerRef.current !== null) {
      window.clearTimeout(midpointTimerRef.current);
      midpointTimerRef.current = null;
    }
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  useEffect(() => {
    return clearTimers;
  }, []);

  const syncDocumentTheme = (nextTheme: Theme) => {
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const faviconHref =
      nextTheme === "light" ? "/favicon-light.svg" : "/favicon-dark.svg";
    let svgIcon = document.querySelector<HTMLLinkElement>(
      'link[rel="icon"][type="image/svg+xml"]'
    );
    if (!svgIcon) {
      svgIcon = document.createElement("link");
      svgIcon.rel = "icon";
      svgIcon.type = "image/svg+xml";
      svgIcon.setAttribute("sizes", "any");
      document.head.appendChild(svgIcon);
    }
    if (svgIcon.getAttribute("href") !== faviconHref) {
      svgIcon.setAttribute("href", faviconHref);
    }
  };

  const applyDomTheme = (nextTheme: Theme) => {
    window.localStorage.setItem("theme", nextTheme);
    syncDocumentTheme(nextTheme);
    startTransition(() => {
      setTheme(nextTheme);
    });
  };

  const toggleTheme = () => {
    const nextTheme: Theme = targetTheme === "light" ? "dark" : "light";
    clearTimers();
    setTargetTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    spaceAudio.playThemeTransition(nextTheme);

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof document === "undefined" || reducedMotion) {
      document.documentElement.classList.remove("theme-transitioning");
      setIsTransitioning(false);
      applyDomTheme(nextTheme);
      return;
    }

    const holeState =
      typeof document !== "undefined"
        ? document.documentElement.dataset.holeBackdrop
        : undefined;
    const hasHoleBackdrop =
      holeState === "ready" ||
      (holeState !== "fallback" &&
        typeof navigator !== "undefined" &&
        "gpu" in navigator);

    setIsTransitioning(true);
    document.documentElement.classList.add("theme-transitioning");

    // Launch the right <-> left swirling hole immediately at t = 0
    // and flip DOM colors cleanly right as the wavefront crosses into the center column.
    const midpointDelay = hasHoleBackdrop ? WEBGPU_MIDPOINT_DELAY_MS : 0;

    if (midpointDelay === 0) {
      applyDomTheme(nextTheme);
    } else {
      midpointTimerRef.current = window.setTimeout(() => {
        midpointTimerRef.current = null;
        applyDomTheme(nextTheme);
      }, midpointDelay);
    }

    finishTimerRef.current = window.setTimeout(() => {
      finishTimerRef.current = null;
      document.documentElement.classList.remove("theme-transitioning");
      setIsTransitioning(false);
    }, TRANSITION_TOTAL_MS);
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme") as Theme | null;
    const resolvedTheme: Theme = localTheme === "light" ? "light" : "dark";

    setTheme(resolvedTheme);
    setTargetTheme(resolvedTheme);
    syncDocumentTheme(resolvedTheme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        targetTheme,
        isTransitioning,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }

  return context;
}
