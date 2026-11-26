"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRenderer, type HoleVariant } from "@/optimized-black-hole/renderer";
import { spaceAudio } from "@/lib/space-audio";

export type BlackHoleStatus = "pending" | "ready" | "fallback";

interface BlackHoleBackgroundProps {
  active?: boolean;
  variant?: HoleVariant;
  onStatusChange?: (status: BlackHoleStatus) => void;
}

/**
 * Full-viewport unified WebGPU black/white-hole backdrop supporting real-time
 * 60 FPS swirling right <-> left flight transitions across Dark and Light modes.
 */
export default function BlackHoleBackground({
  active = true,
  variant = "dark",
  onStatusChange,
}: BlackHoleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createRenderer> | null>(null);
  const activeRef = useRef(active);
  const initialVariantRef = useRef(variant);
  const hasMountedVariantRef = useRef(false);
  activeRef.current = active;

  const [status, setStatus] = useState<BlackHoleStatus>("pending");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    rendererRef.current?.setActive(active);
  }, [active]);

  useEffect(() => {
    if (!hasMountedVariantRef.current) {
      hasMountedVariantRef.current = true;
      return;
    }
    rendererRef.current?.setVariant(variant, true);
  }, [variant]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;

    if (!canvas || typeof navigator === "undefined" || !("gpu" in navigator)) {
      setStatus("fallback");
      return;
    }

    const domVariant: HoleVariant =
      typeof document !== "undefined" &&
      !document.documentElement.classList.contains("dark")
        ? "light"
        : initialVariantRef.current;

    const renderer = createRenderer({
      canvas,
      active: activeRef.current,
      variant: domVariant,
      onMotionChange: (intensity, pan) =>
        spaceAudio.setHoleMotion(intensity, pan),
    });
    rendererRef.current = renderer;

    void renderer.ready
      .then(() => {
        if (!cancelled) {
          setStatus("ready");
        }
      })
      .catch((error) => {
        console.warn("[BlackHoleBackground] WebGPU fallback:", error);
        if (!cancelled) {
          setStatus("fallback");
        }
      });

    return () => {
      cancelled = true;
      spaceAudio.setHoleMotion(0, 0);
      if (rendererRef.current === renderer) {
        rendererRef.current = null;
      }
      renderer.dispose();
    };
  }, []);

  if (status === "fallback") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden transform-gpu transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        status === "ready"
          ? "opacity-100 scale-100"
          : "opacity-0 scale-[1.035]"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none block h-full w-full select-none"
      />
      {/* Subtle center vignettes to preserve contrast for centered Hero & About copy */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_50%_46%,rgba(255,255,255,0.45),rgba(255,255,255,0.14)_65%,transparent_100%)] opacity-100 dark:opacity-0 transition-opacity duration-500 ease-out" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_50%_at_50%_46%,rgba(4,4,8,0.45),rgba(4,4,8,0.14)_65%,transparent_100%)] opacity-0 dark:opacity-100 transition-opacity duration-500 ease-out" />
    </div>
  );
}
