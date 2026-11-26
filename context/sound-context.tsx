"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { spaceAudio } from "@/lib/space-audio";

type SoundContextType = {
  isSoundEnabled: boolean;
  toggleSound: () => void;
};

const SoundContext = createContext<SoundContextType | null>(null);

export default function SoundContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always start muted by default to respect browser autoplay rules and user preference
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const toggleSound = () => {
    const next = !isSoundEnabled;
    spaceAudio.setEnabled(next);
    setIsSoundEnabled(next);
  };

  // Feed scroll and fallback pointer velocity into the audio engine cleanly without React renders
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastScrollAt = performance.now();
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerAt = 0;
    let pointerDecayTimer = 0;

    const handleScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(8, now - lastScrollAt);
      const speedPxPerSec = (Math.abs(y - lastScrollY) / dt) * 1000;
      lastScrollY = y;
      lastScrollAt = now;
      spaceAudio.setScrollMotion(Math.min(1, speedPxPerSec / 1800));
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (typeof navigator !== "undefined" && "gpu" in navigator) {
        return;
      }
      const now = performance.now();
      if (lastPointerAt > 0) {
        const dt = Math.max(8, now - lastPointerAt);
        const dist = Math.hypot(e.clientX - lastPointerX, e.clientY - lastPointerY);
        const speedPxPerSec = (dist / dt) * 1000;
        const pan = Math.max(
          -1,
          Math.min(1, (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1)
        );
        spaceAudio.setHoleMotion(Math.min(1, speedPxPerSec / 1400), pan);
        if (pointerDecayTimer) window.clearTimeout(pointerDecayTimer);
        pointerDecayTimer = window.setTimeout(() => {
          spaceAudio.setHoleMotion(0, pan);
          pointerDecayTimer = 0;
        }, 120);
      }
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerAt = now;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      if (pointerDecayTimer) window.clearTimeout(pointerDecayTimer);
    };
  }, []);

  return (
    <SoundContext.Provider value={{ isSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used within a SoundContextProvider");
  }
  return ctx;
}
